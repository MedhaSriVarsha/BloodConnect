import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { memoryStore } from '../services/db.js';
import { generateCircleCode } from '../utils/crypto.js';
import { smsEmailService } from '../services/smsEmailService.js';
import { logger } from '../utils/logger.js';

// Schemas
export const createCircleSchema = z.object({
  name: z.string().min(2, 'Circle name is required (e.g. "My Family & Close Friends")'),
});

export const joinCircleSchema = z.object({
  circleCode: z.string().min(6, 'Valid Emergency Access Code is required'),
  relationship: z.string().min(2, 'Relationship is required (e.g. Brother, Friend, Colleague)'),
  consentToContact: z.boolean().refine(val => val === true, 'Informed consent to emergency contact is mandatory'),
});

export const createEmergencySchema = z.object({
  circleId: z.string().min(1, 'Circle ID is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  bloodGroup: z.enum([
    'A_POSITIVE', 'A_NEGATIVE', 
    'B_POSITIVE', 'B_NEGATIVE', 
    'AB_POSITIVE', 'AB_NEGATIVE', 
    'O_POSITIVE', 'O_NEGATIVE', 
    'OH_BOMBAY'
  ]),
  unitsNeeded: z.number().int().min(1).max(10).default(1),
  hospitalName: z.string().min(2, 'Hospital or transfusion center name is required'),
  notes: z.string().optional(),
});

export const updateAvailabilitySchema = z.object({
  isOptedIn: z.boolean(),
  availabilityNote: z.string().optional(),
});

export const trustedCircleController = {
  /**
   * 1. Create a Trusted Circle
   * POST /api/v1/trusted-circles
   */
  async createCircle(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Authentication required' });

      const validated = createCircleSchema.parse(req.body);

      // Check if user already owns an active circle
      let existing = memoryStore.trustedCircles.find(c => c.ownerId === userId && c.status === 'ACTIVE');
      if (existing) {
        return res.status(200).json({
          status: 'success',
          message: 'Retrieved your existing Trusted Blood Circle.',
          data: existing,
        });
      }

      const circleCode = generateCircleCode();
      const newCircle = {
        id: `tc-${Date.now()}`,
        ownerId: userId,
        circleCode,
        name: validated.name,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.trustedCircles.unshift(newCircle);

      // Log action
      memoryStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: userId,
        action: 'TRUSTED_CIRCLE_CREATED',
        resourceType: 'TRUSTED_CIRCLE',
        resourceId: newCircle.id,
        details: { circleCode: newCircle.circleCode, name: newCircle.name },
        ipAddress: req.ip,
        createdAt: new Date(),
      });

      return res.status(201).json({
        status: 'success',
        message: 'Your Trusted Blood Circle has been established with your unique Emergency Access Code.',
        data: newCircle,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: err.errors });
      }
      logger.error('Error creating circle', err);
      return res.status(500).json({ status: 'error', message: 'Failed to create circle.' });
    }
  },

  /**
   * 2. Join a Circle via Emergency Access Code
   * POST /api/v1/trusted-circles/join
   */
  async joinCircle(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Authentication required' });

      const validated = joinCircleSchema.parse(req.body);
      const cleanCode = validated.circleCode.trim().toUpperCase();

      const circle = memoryStore.trustedCircles.find(c => c.circleCode.toUpperCase() === cleanCode);
      if (!circle) {
        return res.status(404).json({
          status: 'error',
          code: 'CIRCLE_NOT_FOUND',
          message: 'No active Trusted Blood Circle found with this Emergency Access Code.',
        });
      }

      if (circle.ownerId === userId) {
        return res.status(400).json({
          status: 'error',
          code: 'CANNOT_JOIN_OWN_CIRCLE',
          message: 'You are already the owner and anchor of this circle.',
        });
      }

      // Check if already a member
      const existingMember = memoryStore.trustedCircleMembers.find(
        m => m.circleId === circle.id && m.memberUserId === userId
      );

      if (existingMember) {
        existingMember.status = 'ACCEPTED';
        existingMember.relationship = validated.relationship;
        existingMember.consentToContact = true;
        existingMember.consentTimestamp = new Date();
      } else {
        memoryStore.trustedCircleMembers.push({
          id: `tcm-${Date.now()}`,
          circleId: circle.id,
          memberUserId: userId,
          relationship: validated.relationship,
          status: 'ACCEPTED',
          consentTimestamp: new Date(),
          consentToContact: true,
        });
      }

      // Ensure donor has an availability record
      let avail = memoryStore.donorAvailabilities.find(a => a.userId === userId);
      if (!avail) {
        memoryStore.donorAvailabilities.push({
          id: `da-${Date.now()}`,
          userId,
          isOptedIn: true,
          lastConfirmedAt: new Date(),
          availabilityNote: 'Ready for emergency calls',
        });
      }

      // Notify owner
      const ownerUser = memoryStore.users.find(u => u.id === circle.ownerId);
      const joinerUser = memoryStore.users.find(u => u.id === userId);
      if (ownerUser) {
        memoryStore.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: circle.ownerId,
          type: 'SYSTEM',
          title: 'New Member in your Trusted Circle! 🤝',
          body: `${joinerUser?.fullName || 'A friend'} joined your circle as ${validated.relationship}.`,
          readAt: null,
          createdAt: new Date(),
        });
      }

      return res.status(200).json({
        status: 'success',
        message: `You have successfully joined ${circle.name}. Your consent is recorded.`,
        data: {
          circleId: circle.id,
          circleName: circle.name,
          relationship: validated.relationship,
          consentTimestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: err.errors });
      }
      return res.status(500).json({ status: 'error', message: 'Failed to join circle.' });
    }
  },

  /**
   * 3. Lookup circle preview (safe, without exposing members to public)
   * GET /api/v1/trusted-circles/lookup/:code
   */
  async lookupCircle(req: AuthenticatedRequest, res: Response) {
    const { code } = req.params;
    const cleanCode = code.trim().toUpperCase();

    const circle = memoryStore.trustedCircles.find(c => c.circleCode.toUpperCase() === cleanCode);
    if (!circle) {
      return res.status(404).json({ status: 'error', message: 'Emergency Access Code not found.' });
    }

    const owner = memoryStore.users.find(u => u.id === circle.ownerId);
    const memberCount = memoryStore.trustedCircleMembers.filter(m => m.circleId === circle.id && m.status === 'ACCEPTED').length;

    return res.status(200).json({
      status: 'success',
      data: {
        circleId: circle.id,
        circleCode: circle.circleCode,
        circleName: circle.name,
        ownerFirstName: owner ? owner.fullName.split(' ')[0] : 'BloodConnect Anchor',
        memberCount,
      },
    });
  },

  /**
   * 4. Get User's Circle & Memberships
   * GET /api/v1/trusted-circles/my
   */
  async getMyCircles(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId || !req.user) return res.status(401).json({ status: 'error', message: 'Authentication required' });

    // 1. Owned Circle
    let ownedCircle = memoryStore.trustedCircles.find(c => c.ownerId === userId && c.status === 'ACTIVE');
    if (!ownedCircle) {
      // Auto-create initial default circle with predictable user-friendly code
      ownedCircle = {
        id: `tc-${Date.now()}`,
        ownerId: userId,
        circleCode: generateCircleCode(),
        name: `${req.user.fullName.split(' ')[0]}'s Trusted Blood Circle`,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.trustedCircles.push(ownedCircle);
    }

    // 2. Circles user has joined
    const memberships = memoryStore.trustedCircleMembers
      .filter(m => m.memberUserId === userId && m.status === 'ACCEPTED')
      .map(m => {
        const circle = memoryStore.trustedCircles.find(c => c.id === m.circleId);
        const owner = memoryStore.users.find(u => u.id === circle?.ownerId);
        return {
          id: m.id,
          circleId: m.circleId,
          circleName: circle?.name || 'Trusted Circle',
          ownerName: owner?.fullName || 'Circle Owner',
          relationship: m.relationship,
          consentTimestamp: m.consentTimestamp,
        };
      });

    // 3. User's availability
    let availability = memoryStore.donorAvailabilities.find(a => a.userId === userId);
    if (!availability) {
      availability = {
        id: `da-${Date.now()}`,
        userId,
        isOptedIn: true,
        lastConfirmedAt: new Date(),
        availabilityNote: 'Ready for emergency assistance',
      };
      memoryStore.donorAvailabilities.push(availability);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        ownedCircle,
        joinedCircles: memberships,
        myAvailability: availability,
      },
    });
  },

  /**
   * 5. Retrieve authorized member details
   * GET /api/v1/trusted-circles/:id/members
   */
  async getCircleMembers(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId || !req.user) return res.status(401).json({ status: 'error', message: 'Authentication required' });

      const { id } = req.params;
      const circle = memoryStore.trustedCircles.find(c => c.id === id || c.circleCode.toUpperCase() === id.toUpperCase());

      if (!circle) {
        return res.status(404).json({ status: 'error', message: 'Circle not found.' });
      }

      // Authorization check: User must be circle owner or accepted member or admin
      const isOwner = circle.ownerId === userId;
      const isMember = memoryStore.trustedCircleMembers.some(
        m => m.circleId === circle.id && m.memberUserId === userId && m.status === 'ACCEPTED'
      );
      const isAdmin = req.user.roles.includes('ADMIN');

      if (!isOwner && !isMember && !isAdmin) {
        return res.status(403).json({
          status: 'error',
          code: 'FORBIDDEN_CIRCLE_ACCESS',
          message: 'Access to this Trusted Blood Circle is restricted to authorized members.',
        });
      }

      // Audit log the access for confidentiality compliance
      memoryStore.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: userId,
        action: 'TRUSTED_CIRCLE_ACCESSED',
        resourceType: 'TRUSTED_CIRCLE',
        resourceId: circle.id,
        details: { requesterId: userId, isOwner },
        ipAddress: req.ip,
        createdAt: new Date(),
      });

      // Fetch member profiles
      const memberLinks = memoryStore.trustedCircleMembers.filter(
        m => m.circleId === circle.id && m.status === 'ACCEPTED'
      );

      const members = memberLinks.map(m => {
        const user = memoryStore.users.find(u => u.id === m.memberUserId);
        const profile = memoryStore.donorProfiles.find(dp => dp.userId === m.memberUserId);
        const avail = memoryStore.donorAvailabilities.find(a => a.userId === m.memberUserId);

        return {
          memberId: m.id,
          userId: m.memberUserId,
          fullName: user ? user.fullName : 'Trusted Donor',
          relationship: m.relationship || 'Emergency Donor',
          bloodGroup: profile ? profile.bloodGroup : 'O_POSITIVE',
          city: profile ? profile.city : 'Bengaluru',
          area: profile ? profile.address : 'Indiranagar',
          contactPhone: m.consentToContact && user ? user.phone : 'Consent Withheld',
          isAvailable: avail ? avail.isOptedIn : true,
          lastConfirmedAt: avail ? avail.lastConfirmedAt : m.consentTimestamp,
          availabilityNote: avail?.availabilityNote || 'Ready to assist',
          consentTimestamp: m.consentTimestamp,
        };
      });

      return res.status(200).json({
        status: 'success',
        data: {
          circleId: circle.id,
          circleCode: circle.circleCode,
          circleName: circle.name,
          ownerId: circle.ownerId,
          totalMembers: members.length,
          availableCount: members.filter(m => m.isAvailable).length,
          members,
        },
      });
    } catch (err: any) {
      logger.error('Error fetching circle members', err);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve members.' });
    }
  },

  /**
   * 6. Remove member or withdraw consent
   * DELETE /api/v1/trusted-circles/:id/members/:memberId
   */
  async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Authentication required' });

      const { id, memberId } = req.params;
      const circle = memoryStore.trustedCircles.find(c => c.id === id);
      if (!circle) return res.status(404).json({ status: 'error', message: 'Circle not found' });

      const memberIndex = memoryStore.trustedCircleMembers.findIndex(
        m => m.circleId === circle.id && (m.id === memberId || m.memberUserId === memberId)
      );

      if (memberIndex === -1) {
        return res.status(404).json({ status: 'error', message: 'Member record not found in circle' });
      }

      const targetMember = memoryStore.trustedCircleMembers[memberIndex];
      const isOwner = circle.ownerId === userId;
      const isSelf = targetMember.memberUserId === userId;

      if (!isOwner && !isSelf) {
        return res.status(403).json({ status: 'error', message: 'Unauthorized to remove this member.' });
      }

      memoryStore.trustedCircleMembers.splice(memberIndex, 1);

      return res.status(200).json({
        status: 'success',
        message: isSelf ? 'You have successfully left the circle.' : 'Member removed from your trusted circle.',
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: 'Failed to remove member.' });
    }
  },

  /**
   * 7. Create an Emergency Request
   * POST /api/v1/emergencies
   */
  async createEmergency(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Authentication required' });

      const validated = createEmergencySchema.parse(req.body);

      const emergency = {
        id: `emg-${Date.now()}`,
        circleId: validated.circleId,
        requesterId: userId,
        patientName: validated.patientName,
        bloodGroup: validated.bloodGroup,
        unitsNeeded: validated.unitsNeeded,
        hospitalName: validated.hospitalName,
        status: 'ALERTED',
        notes: validated.notes || 'Immediate assistance requested by circle anchor.',
        dispatchedAt: new Date(),
      };

      memoryStore.circleEmergencies.unshift(emergency);

      return res.status(201).json({
        status: 'success',
        message: 'Emergency recorded. Ready to broadcast to circle.',
        data: emergency,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: err.errors });
      }
      return res.status(500).json({ status: 'error', message: 'Failed to create emergency.' });
    }
  },

  /**
   * 8. Notify Consenting Circle Members Instantly
   * POST /api/v1/emergencies/:id/notify-circle
   */
  async notifyCircle(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Authentication required' });

      const { id } = req.params;
      const { circleId, patientName, bloodGroup, unitsNeeded, hospitalName } = req.body;

      const circle = memoryStore.trustedCircles.find(c => c.id === circleId || c.circleCode.toUpperCase() === circleId?.toUpperCase());
      if (!circle) return res.status(404).json({ status: 'error', message: 'Circle not found' });

      const members = memoryStore.trustedCircleMembers.filter(
        m => m.circleId === circle.id && m.status === 'ACCEPTED' && m.consentToContact
      );

      let notifiedCount = 0;
      for (const m of members) {
        const memberUser = memoryStore.users.find(u => u.id === m.memberUserId);
        if (memberUser) {
          smsEmailService.sendUrgentBloodAlert(
            memberUser.phone, 
            bloodGroup || 'URGENT', 
            hospitalName || 'Emergency Center', 
            unitsNeeded || 1
          );

          memoryStore.notifications.unshift({
            id: `notif-${Date.now()}-${m.memberUserId}`,
            userId: m.memberUserId,
            type: 'REQUEST_ALERT',
            title: `🚨 EMERGENCY CIRCLE CALL: ${circle.name}`,
            body: `Urgent ${bloodGroup || ''} blood needed for ${patientName || 'patient'} at ${hospitalName || 'hospital'}. Tap to assist!`,
            readAt: null,
            createdAt: new Date(),
          });
          notifiedCount++;
        }
      }

      return res.status(200).json({
        status: 'success',
        message: `Emergency broadcast delivered to ${notifiedCount} consenting circle members.`,
        data: {
          circleId: circle.id,
          notifiedMembersCount: notifiedCount,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      logger.error('Error notifying circle', err);
      return res.status(500).json({ status: 'error', message: 'Failed to notify circle.' });
    }
  },

  /**
   * 9. Update Donor Availability & Confirmation Timestamp
   * PATCH /api/v1/trusted-circles/me/availability
   */
  async updateMyAvailability(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Authentication required' });

      const validated = updateAvailabilitySchema.parse(req.body);

      let record = memoryStore.donorAvailabilities.find(a => a.userId === userId);
      if (!record) {
        record = {
          id: `da-${Date.now()}`,
          userId,
          isOptedIn: validated.isOptedIn,
          lastConfirmedAt: new Date(),
          availabilityNote: validated.availabilityNote || null,
        };
        memoryStore.donorAvailabilities.push(record);
      } else {
        record.isOptedIn = validated.isOptedIn;
        record.lastConfirmedAt = new Date();
        if (validated.availabilityNote !== undefined) {
          record.availabilityNote = validated.availabilityNote;
        }
      }

      return res.status(200).json({
        status: 'success',
        message: `Availability updated to ${record.isOptedIn ? 'ACTIVE' : 'STANDBY'}. Last confirmed just now.`,
        data: record,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: err.errors });
      }
      return res.status(500).json({ status: 'error', message: 'Failed to update availability.' });
    }
  }
};
