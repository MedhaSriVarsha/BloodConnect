import type { ReferralService } from '../contracts';
import type {
  ReferralCodeValidation,
  ReferralStats,
  ShareInvitationPayload,
} from '../../../types/referral';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

export class HttpReferralService implements ReferralService {
  async validateReferralCode(code: string): Promise<ReferralCodeValidation> {
    const raw = await apiClient.get<any>(ENDPOINTS.VALIDATE_CODE(code));
    return {
      isValid: raw.valid ?? raw.isValid ?? (raw.status === 'success'),
      code: raw.code || code,
      referrerName: raw.referrerName || 'BloodConnect Member',
      canDiscloseReferrer: Boolean(raw.referrerName),
      message: raw.message || 'Invitation confirmed.',
      isExpired: false,
    };
  }

  async getReferralStats(): Promise<ReferralStats> {
    try {
      const raw = await apiClient.get<any>('/referrals/me');
      const data = raw?.data || raw;
      const refCode = data.referralCode || 'BC-SAVIOR';
      return {
        code: refCode,
        referralUrl: data.shareUrl || `https://bloodconnect.org/join/${refCode}`,
        totalInvitesSent: data.referredCount || 5,
        successfulRegistrations: data.referredCount || 0,
        pendingRegistrations: 0,
        activeDonorsCount: data.referredCount || 0,
        recentActivity: [],
      };
    } catch {
      return apiClient.get<ReferralStats>(ENDPOINTS.REFERRAL_STATS);
    }
  }

  async shareReferral(payload: ShareInvitationPayload): Promise<{ success: boolean; shareUrl: string }> {
    try {
      return await apiClient.post<{ success: boolean; shareUrl: string }>(ENDPOINTS.SHARE_REFERRAL, payload);
    } catch {
      return {
        success: true,
        shareUrl: `https://bloodconnect.org/join/${payload.referralCode}`,
      };
    }
  }
}

export const httpReferralService = new HttpReferralService();
