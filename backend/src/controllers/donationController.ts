import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/index.js';
import { memoryStore } from '../services/db.js';
import { generateCertificateNumber } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export const logDonationSchema = z.object({
  hospitalName: z.string().min(2, 'Hospital or blood bank name required'),
  bloodRequestId: z.string().optional(),
  donationDate: z.string().optional(),
  unitsDonated: z.number().int().min(1).max(3).default(1),
  bloodGroup: z.enum([
    'A_POSITIVE', 'A_NEGATIVE', 
    'B_POSITIVE', 'B_NEGATIVE', 
    'AB_POSITIVE', 'AB_NEGATIVE', 
    'O_POSITIVE', 'O_NEGATIVE', 
    'OH_BOMBAY'
  ]),
  notes: z.string().optional(),
});

function calculateBadge(count: number): string {
  if (count >= 16) return 'PLATINUM';
  if (count >= 8) return 'GOLD';
  if (count >= 4) return 'SILVER';
  return 'BRONZE';
}

export const donationController = {
  /**
   * Get authenticated user's donation history
   */
  async getMyDonations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Authentication required' });
      }

      const donations = memoryStore.donations
        .filter(d => d.donorId === userId)
        .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());

      const donorProfile = memoryStore.donorProfiles.find(dp => dp.userId === userId);

      // Calculate next eligible date (90 days after last donation)
      let nextEligibleDate = null;
      let daysUntilEligible = 0;
      if (donations.length > 0) {
        const lastDonation = new Date(donations[0].donationDate);
        const eligible = new Date(lastDonation.getTime() + 90 * 24 * 60 * 60 * 1000);
        nextEligibleDate = eligible.toISOString();
        const diffMs = eligible.getTime() - Date.now();
        daysUntilEligible = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      return res.status(200).json({
        status: 'success',
        data: {
          totalDonations: donations.length,
          badgeLevel: donorProfile?.badgeLevel || calculateBadge(donations.length),
          livesImpacted: donations.length * 3, // Each unit can save up to 3 lives!
          nextEligibleDate,
          daysUntilEligible,
          donations,
        },
      });
    } catch (err: any) {
      logger.error('Error fetching donation history', err);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve donation history.' });
    }
  },

  /**
   * Log a new donation and receive a certificate
   */
  async logDonation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Authentication required' });
      }

      const validated = logDonationSchema.parse(req.body);
      const donationDate = validated.donationDate ? new Date(validated.donationDate) : new Date();
      const certificateNumber = generateCertificateNumber();

      const newDonation = {
        id: `don-${Date.now()}`,
        donorId: userId,
        bloodRequestId: validated.bloodRequestId || null,
        hospitalName: validated.hospitalName,
        donationDate,
        unitsDonated: validated.unitsDonated,
        bloodGroup: validated.bloodGroup,
        status: 'COMPLETED',
        certificateNumber,
        notes: validated.notes || 'Routine voluntary whole blood donation.',
        createdAt: new Date(),
      };

      memoryStore.donations.unshift(newDonation);

      // Update donor profile stats
      let donorProfile = memoryStore.donorProfiles.find(dp => dp.userId === userId);
      const allUserDonations = memoryStore.donations.filter(d => d.donorId === userId);
      const totalCount = allUserDonations.length;
      const newBadge = calculateBadge(totalCount);

      if (donorProfile) {
        donorProfile.lastDonationDate = donationDate;
        donorProfile.totalDonationsCount = totalCount;
        donorProfile.badgeLevel = newBadge;
      }

      // Add thank you notification
      memoryStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId,
        type: 'SYSTEM',
        title: 'Thank you for saving lives! ❤️',
        body: `Your donation at ${validated.hospitalName} was recorded. Certificate #${certificateNumber} issued.`,
        readAt: null,
        createdAt: new Date(),
      });

      return res.status(201).json({
        status: 'success',
        message: 'Donation successfully registered and verified.',
        data: {
          donation: newDonation,
          badgeLevel: newBadge,
          certificateNumber,
          nextEligibleDate: new Date(donationDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', errors: err.errors });
      }
      logger.error('Log donation error', err);
      return res.status(500).json({ status: 'error', message: 'Failed to record donation.' });
    }
  },

  /**
   * Verify a donation certificate by Certificate Number
   */
  async verifyCertificate(req: AuthenticatedRequest, res: Response) {
    try {
      const { certificateNumber } = req.params;
      const donation = memoryStore.donations.find(
        d => d.certificateNumber.toUpperCase() === certificateNumber.toUpperCase()
      );

      if (!donation) {
        return res.status(404).json({
          status: 'error',
          code: 'CERTIFICATE_NOT_FOUND',
          message: 'Certificate not found or verification number is invalid.',
        });
      }

      const donor = memoryStore.users.find(u => u.id === donation.donorId);

      return res.status(200).json({
        status: 'success',
        data: {
          certificateNumber: donation.certificateNumber,
          donorName: donor ? donor.fullName : 'Verified BloodConnect Hero',
          bloodGroup: donation.bloodGroup,
          hospitalName: donation.hospitalName,
          donationDate: donation.donationDate,
          status: donation.status,
          verificationSeal: 'OFFICIAL_BLOODCONNECT_VERIFIED',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: 'Verification error' });
    }
  }
};
