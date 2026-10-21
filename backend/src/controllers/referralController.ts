import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { memoryStore } from '../services/db.js';
import { generateReferralCode } from '../utils/crypto.js';

export const referralController = {
  /**
   * Get authenticated user's referral code & stats
   */
  async getMyReferral(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Auth required' });

    let referral = memoryStore.referrals.find(r => r.referrerUserId === userId);
    if (!referral) {
      referral = {
        id: `ref-${Date.now()}`,
        referrerUserId: userId,
        referralCode: generateReferralCode('BC'),
        referredUserId: null,
        rewardPoints: 50,
        createdAt: new Date(),
      };
      memoryStore.referrals.push(referral);
    }

    const referredCount = memoryStore.referrals.filter(r => r.referrerUserId === userId && r.referredUserId).length;

    return res.status(200).json({
      status: 'success',
      data: {
        referralCode: referral.referralCode,
        rewardPoints: referral.rewardPoints,
        referredCount,
        shareUrl: `https://bloodconnect.org/join?ref=${referral.referralCode}`,
        rewardsTier: referral.rewardPoints >= 200 ? 'COMMUNITY_CHAMPION' : 'BLOOD_AMBASSADOR',
      },
    });
  },

  /**
   * Validate referral code
   */
  async validateCode(req: AuthenticatedRequest, res: Response) {
    const { code } = req.params;
    const referral = memoryStore.referrals.find(r => r.referralCode.toUpperCase() === code.toUpperCase());

    if (!referral) {
      return res.status(404).json({ status: 'error', valid: false, message: 'Invalid referral code.' });
    }

    const referrer = memoryStore.users.find(u => u.id === referral.referrerUserId);

    return res.status(200).json({
      status: 'success',
      valid: true,
      referrerName: referrer ? referrer.fullName : 'BloodConnect Advocate',
      code: referral.referralCode,
    });
  }
};
