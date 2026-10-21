import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { memoryStore } from '../services/db.js';
import { logger } from '../utils/logger.js';

export const donorController = {
  /**
   * Search nearby donors with privacy redaction
   */
  async searchDonors(req: AuthenticatedRequest, res: Response) {
    try {
      const { bloodGroup, city, availableOnly } = req.query;

      let donors = [...memoryStore.donorProfiles];

      if (bloodGroup) {
        donors = donors.filter(d => d.bloodGroup === bloodGroup);
      }
      if (city) {
        donors = donors.filter(d => d.city.toLowerCase().includes((city as string).toLowerCase()));
      }
      if (availableOnly === 'true' || availableOnly === undefined) {
        donors = donors.filter(d => d.isAvailable);
      }

      // Redact sensitive contact numbers unless caller is an admin or consent granted
      const sanitized = donors.map(dp => {
        const user = memoryStore.users.find(u => u.id === dp.userId);
        const isAdmin = req.user?.roles.includes('ADMIN');

        return {
          id: dp.id,
          userId: dp.userId,
          fullName: user ? (user.fullName.split(' ')[0] + ' ' + (user.fullName.split(' ')[1]?.[0] || '') + '.') : 'Anonymous Donor',
          bloodGroup: dp.bloodGroup,
          city: dp.city,
          state: dp.state,
          postalCode: dp.postalCode,
          isAvailable: dp.isAvailable,
          badgeLevel: dp.badgeLevel,
          totalDonationsCount: dp.totalDonationsCount,
          lastDonationDate: dp.lastDonationDate,
          // Only reveal direct phone if donor consented or caller is privileged
          contactPhone: (isAdmin || dp.consentToContact) && req.user ? user?.phone : 'Contact via Platform Request',
        };
      });

      return res.status(200).json({
        status: 'success',
        count: sanitized.length,
        data: sanitized,
      });
    } catch (err: any) {
      logger.error('Search donors error', err);
      return res.status(500).json({ status: 'error', message: 'Failed to search donors.' });
    }
  },

  /**
   * Toggle current donor's availability status
   */
  async toggleAvailability(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Auth required' });

      let profile = memoryStore.donorProfiles.find(dp => dp.userId === userId);
      if (!profile) {
        return res.status(404).json({ status: 'error', message: 'Donor profile not found. Please register profile first.' });
      }

      const { isAvailable } = req.body;
      profile.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !profile.isAvailable;
      profile.updatedAt = new Date();

      return res.status(200).json({
        status: 'success',
        message: `Donor availability updated to ${profile.isAvailable ? 'AVAILABLE' : 'OFFLINE'}.`,
        data: {
          isAvailable: profile.isAvailable,
          userId: profile.userId,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: 'Failed to update availability.' });
    }
  },

  /**
   * Get single donor profile with consent checking
   */
  async getDonorById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const profile = memoryStore.donorProfiles.find(d => d.id === id || d.userId === id);

      if (!profile) {
        return res.status(404).json({ status: 'error', message: 'Donor not found.' });
      }

      const user = memoryStore.users.find(u => u.id === profile.userId);
      const isOwner = req.user?.id === profile.userId;
      const isAdmin = req.user?.roles.includes('ADMIN');

      return res.status(200).json({
        status: 'success',
        data: {
          id: profile.id,
          userId: profile.userId,
          fullName: isOwner || isAdmin ? user?.fullName : (user?.fullName.split(' ')[0] + ' ***'),
          bloodGroup: profile.bloodGroup,
          city: profile.city,
          state: profile.state,
          isAvailable: profile.isAvailable,
          badgeLevel: profile.badgeLevel,
          totalDonationsCount: profile.totalDonationsCount,
          lastDonationDate: profile.lastDonationDate,
          contactPhone: isOwner || isAdmin || profile.consentToContact ? user?.phone : 'Protected by Privacy Consent',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: 'Error retrieving donor.' });
    }
  }
};
