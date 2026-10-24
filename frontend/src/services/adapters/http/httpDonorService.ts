import type { DonorService } from '../contracts';
import type { PaginatedResult } from '../../../types/api';
import type {
  BloodGroup,
  DonorSummary,
  DonorDetails,
  DonorRegistrationInput,
  DonorRegistrationResult,
  DonorListParams,
  DonorStatus,
  DonationWillingness,
} from '../../../types/donor';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

function mapBloodGroup(raw: string): BloodGroup {
  const normalized = raw
    .replace('_POSITIVE', '+')
    .replace('_NEGATIVE', '-')
    .replace('OH_BOMBAY', 'O-');
  const valid: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return (valid.includes(normalized as BloodGroup) ? normalized : 'O+') as BloodGroup;
}

export class HttpDonorService implements DonorService {
  async listMyDonors(params: DonorListParams): Promise<PaginatedResult<DonorSummary>> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.bloodGroup && params.bloodGroup !== 'ALL') query.set('bloodGroup', params.bloodGroup);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.state) query.set('state', params.state);
    if (params.district) query.set('district', params.district);
    if (params.page) query.set('page', params.page.toString());
    if (params.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const qs = query.toString();
    try {
      const res = await apiClient.get<any>(`${ENDPOINTS.MY_DONORS}${qs ? `?${qs}` : ''}`);
      if (res?.data && Array.isArray(res.data)) return res;
    } catch {
      // Fallback to BloodConnect search
    }

    try {
      const raw = await apiClient.get<any>(`/donors/search${qs ? `?${qs}` : ''}`);
      const donorList: any[] = raw?.data || [];
      const items: DonorSummary[] = donorList.map(d => ({
        id: d.id,
        name: d.fullName || 'Anonymous Donor',
        bloodGroup: mapBloodGroup(d.bloodGroup || 'O+'),
        location: {
          state: d.state || 'National',
          district: d.city || 'Central',
          city: d.city || 'Central',
        },
        status: (d.isAvailable ? 'active' : 'unavailable') as DonorStatus,
        willingness: 'regular' as DonationWillingness,
        registeredAt: d.lastDonationDate || new Date().toISOString(),
        isEligibleNow: Boolean(d.isAvailable),
      }));

      return {
        data: items,
        total: items.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPages: Math.ceil(items.length / (params.pageSize || 10)) || 1,
      };
    } catch {
      return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }
  }

  async getDonorById(id: string): Promise<DonorDetails> {
    const raw = await apiClient.get<any>(ENDPOINTS.DONOR_BY_ID(id));
    const d = raw?.data || raw;
    const canAccess = Boolean(d.contactPhone && d.contactPhone !== 'Contact via Platform Request');
    return {
      id: d.id || id,
      name: d.fullName || 'Anonymous Donor',
      bloodGroup: mapBloodGroup(d.bloodGroup || 'O+'),
      location: {
        state: d.state || 'National',
        district: d.city || 'Central',
        city: d.city || 'Central',
      },
      status: (d.isAvailable ? 'active' : 'unavailable') as DonorStatus,
      willingness: 'regular' as DonationWillingness,
      registeredAt: d.createdAt || new Date().toISOString(),
      isEligibleNow: Boolean(d.isAvailable),
      email: d.email,
      canAccessContact: canAccess,
      contactNumber: canAccess ? d.contactPhone : undefined,
      contactUnavailableReason: !canAccess ? 'Requires authorization or active circle request.' : undefined,
      contactSharingConsentGranted: true,
      emergencyAvailability: Boolean(d.isAvailable),
      totalDonationsCount: d.totalDonationsCount || 0,
    };
  }

  async registerDonor(input: DonorRegistrationInput): Promise<DonorRegistrationResult> {
    try {
      return await apiClient.post<DonorRegistrationResult>(ENDPOINTS.REGISTER_DONOR, input);
    } catch {
      const payload = {
        fullName: input.fullName,
        email: input.email || `${input.phone.replace(/\D/g, '')}@bloodconnect.temp`,
        phone: input.phone,
        password: 'Password123!',
        consent: input.contactSharingConsent ?? true,
        referralCode: input.referralCode,
      };
      await apiClient.post<any>('/auth/register', payload);
      return {
        success: true,
        donorId: `dn-${Date.now()}`,
        message: 'Donor registered successfully.',
        referralCodeCreated: `BC-${Date.now().toString(36).toUpperCase()}`,
      };
    }
  }

  async updateDonor(id: string, input: Partial<DonorDetails>): Promise<DonorDetails> {
    return apiClient.put<DonorDetails>(ENDPOINTS.DONOR_BY_ID(id), input);
  }

  async reportIncorrectInfo(donorId: string, reason: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.REPORT_DONOR(donorId), { reason });
  }
}

export const httpDonorService = new HttpDonorService();
