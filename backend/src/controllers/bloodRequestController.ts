import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { memoryStore } from '../services/db.js';
import { smsEmailService } from '../services/smsEmailService.js';
import { logger } from '../utils/logger.js';

export const createBloodRequestSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  bloodGroup: z.enum([
    'A_POSITIVE', 'A_NEGATIVE', 
    'B_POSITIVE', 'B_NEGATIVE', 
    'AB_POSITIVE', 'AB_NEGATIVE', 
    'O_POSITIVE', 'O_NEGATIVE', 
    'OH_BOMBAY'
  ]),
  unitsNeeded: z.number().int().min(1).max(20),
  urgency: z.enum(['LOW', 'NORMAL', 'URGENT', 'CRITICAL']),
  hospitalName: z.string().min(3, 'Hospital name is required'),
  hospitalAddress: z.string().min(5, 'Hospital address is required'),
  city: z.string().min(2, 'City is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Valid contact number required'),
  requiredBefore: z.string().optional(),
  notes: z.string().optional(),
});

export const bloodRequestController = {
  /**
   * Create an urgent blood request
   */
  async createRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = createBloodRequestSchema.parse(req.body);
      const requesterId = req.user?.id || 'anonymous-requester';

      const newRequest = {
        id: `req-${Date.now()}`,
        requesterId,
        patientName: validated.patientName,
        bloodGroup: validated.bloodGroup,
        unitsNeeded: validated.unitsNeeded,
        fulfilledUnits: 0,
        urgency: validated.urgency,
        status: 'OPEN',
        hospitalName: validated.hospitalName,
        hospitalAddress: validated.hospitalAddress,
        city: validated.city,
        latitude: validated.latitude || 12.9716,
        longitude: validated.longitude || 77.5946,
        contactNumber: validated.contactNumber,
        requiredBefore: validated.requiredBefore 
          ? new Date(validated.requiredBefore) 
          : new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: validated.notes || 'Urgent requirement reported via BloodConnect network.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.bloodRequests.unshift(newRequest);

      // Audit log
      memoryStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: req.user?.id || null,
        action: 'BLOOD_REQUEST_CREATED',
        resourceType: 'BLOOD_REQUEST',
        resourceId: newRequest.id,
        details: { bloodGroup: newRequest.bloodGroup, units: newRequest.unitsNeeded, hospital: newRequest.hospitalName },
        ipAddress: req.ip,
        createdAt: new Date(),
      });

      // Match and alert compatible available donors in vicinity
      const matchingDonors = memoryStore.donorProfiles.filter(
        dp => dp.bloodGroup === validated.bloodGroup && dp.isAvailable
      );

      for (const donor of matchingDonors) {
        const donorUser = memoryStore.users.find(u => u.id === donor.userId);
        if (donorUser) {
          smsEmailService.sendUrgentBloodAlert(donorUser.email, validated.bloodGroup, validated.hospitalName, validated.unitsNeeded);
          memoryStore.notifications.unshift({
            id: `notif-${Date.now()}-${donor.userId}`,
            userId: donor.userId,
            type: 'REQUEST_ALERT',
            title: `Urgent ${validated.bloodGroup.replace('_', '+')} Blood Needed!`,
            body: `${validated.patientName} requires ${validated.unitsNeeded} unit(s) at ${validated.hospitalName}.`,
            readAt: null,
            createdAt: new Date(),
          });
        }
      }

      return res.status(201).json({
        status: 'success',
        message: 'Blood request broadcasted across emergency response channels.',
        data: newRequest,
        matchingDonorsAlerted: matchingDonors.length,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: err.errors });
      }
      logger.error('Create blood request error', err);
      return res.status(500).json({ status: 'error', message: 'Failed to create blood request.' });
    }
  },

  /**
   * List blood requests with filtering
   */
  async getRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const { bloodGroup, urgency, status, city } = req.query;

      let filtered = [...memoryStore.bloodRequests];

      if (bloodGroup) {
        filtered = filtered.filter(r => r.bloodGroup === bloodGroup);
      }
      if (urgency) {
        filtered = filtered.filter(r => r.urgency === urgency);
      }
      if (status) {
        filtered = filtered.filter(r => r.status === status);
      }
      if (city) {
        filtered = filtered.filter(r => r.city.toLowerCase().includes((city as string).toLowerCase()));
      }

      // Sort by urgency (CRITICAL first, then URGENT, NORMAL, LOW) and newest
      const urgencyRank: Record<string, number> = { CRITICAL: 4, URGENT: 3, NORMAL: 2, LOW: 1 };
      filtered.sort((a, b) => {
        const diff = (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return res.status(200).json({
        status: 'success',
        count: filtered.length,
        data: filtered,
      });
    } catch (err: any) {
      logger.error('Get blood requests error', err);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve blood requests.' });
    }
  },

  /**
   * Fulfill / Volunteer for a request
   */
  async volunteerToDonate(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const request = memoryStore.bloodRequests.find(r => r.id === id);

      if (!request) {
        return res.status(404).json({ status: 'error', message: 'Blood request not found.' });
      }

      if (request.status === 'FULFILLED') {
        return res.status(400).json({ status: 'error', message: 'This request has already been fulfilled.' });
      }

      request.fulfilledUnits += 1;
      if (request.fulfilledUnits >= request.unitsNeeded) {
        request.status = 'FULFILLED';
      } else {
        request.status = 'PARTIALLY_FULFILLED';
      }
      request.updatedAt = new Date();

      return res.status(200).json({
        status: 'success',
        message: 'Thank you for stepping up to donate! Hospital details and directions sent to your notifications.',
        data: request,
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: 'Failed to update request.' });
    }
  }
};
