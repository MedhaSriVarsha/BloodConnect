import type { ConsentService } from '../contracts';
import type { PaginatedResult } from '../../../types/api';
import type { UserConsentPreferences, ConsentRecord } from '../../../types/consent';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

export class HttpConsentService implements ConsentService {
  async getConsentPreferences(): Promise<UserConsentPreferences> {
    return apiClient.get<UserConsentPreferences>(ENDPOINTS.CONSENT_PREFERENCES);
  }

  async updateConsent(update: {
    contactSharingAllowed?: boolean;
    emergencyBroadcastAllowed?: boolean;
    smsNotificationsAllowed?: boolean;
  }): Promise<UserConsentPreferences> {
    return apiClient.patch<UserConsentPreferences>(ENDPOINTS.CONSENT_PREFERENCES, update);
  }

  async listConsentsAdmin(params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResult<ConsentRecord>> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page.toString());
    if (params.pageSize) query.set('pageSize', params.pageSize.toString());

    const qs = query.toString();
    return apiClient.get<PaginatedResult<ConsentRecord>>(`${ENDPOINTS.ADMIN_CONSENTS}${qs ? `?${qs}` : ''}`);
  }
}

export const httpConsentService = new HttpConsentService();
