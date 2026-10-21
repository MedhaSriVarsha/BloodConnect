const API_BASE = '/api/v1';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: any;
  count?: number;
  errors?: any[];
  code?: string;
  matchingDonorsAlerted?: number;
}

let authToken: string | null = localStorage.getItem('bc_access_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('bc_access_token', token);
  } else {
    localStorage.removeItem('bc_access_token');
  }
};

export const getAuthToken = () => authToken;

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        status: 'error',
        code: data.code || 'HTTP_ERROR',
        message: data.message || `Request failed with status ${res.status}`,
        errors: data.errors,
      };
    }
    return data;
  } catch (err: any) {
    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message: err.message || 'Network connection failed. Ensure backend server is running.',
    };
  }
}

export const api = {
  // Auth & 5-Step Verification
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (destination: string, otp: string) => 
    request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ destination, otp, purpose: 'EMAIL_VERIFICATION' }) }),
  verifyPhone: (destination: string, otp: string) => 
    request('/auth/verify-phone', { method: 'POST', body: JSON.stringify({ destination, otp, purpose: 'PHONE_VERIFICATION' }) }),
  resendOtp: (destination: string, purpose: string) => 
    request('/auth/otp/resend', { method: 'POST', body: JSON.stringify({ destination, purpose }) }),
  completeDonorProfile: (body: any) => 
    request('/auth/donor-profile', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Blood Requests
  getRequests: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/blood-requests${q}`);
  },
  createRequest: (body: any) => request('/blood-requests', { method: 'POST', body: JSON.stringify(body) }),
  volunteerToDonate: (id: string) => request(`/blood-requests/${id}/volunteer`, { method: 'POST' }),

  // Donations & Certificates
  getMyDonations: () => request('/donations/my'),
  logDonation: (body: any) => request('/donations/log', { method: 'POST', body: JSON.stringify(body) }),
  verifyCertificate: (certNumber: string) => request(`/donations/certificate/${certNumber}`),

  // Eligibility
  evaluateEligibility: (body: any) => request('/eligibility/evaluate', { method: 'POST', body: JSON.stringify(body) }),
  getMyAssessments: () => request('/eligibility/my-history'),

  // Donors
  searchDonors: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/donors/search${q}`);
  },
  toggleAvailability: (isAvailable?: boolean) => 
    request('/donors/me/availability', { method: 'PATCH', body: JSON.stringify({ isAvailable }) }),
  getDonorById: (id: string) => request(`/donors/${id}`),

  // Referrals & Trusted Circles
  getMyReferral: () => request('/referrals/me'),
  validateReferralCode: (code: string) => request(`/referrals/validate/${code}`),

  // Trusted Blood Circles & Emergency Access Codes
  createCircle: (body: { name: string }) => 
    request('/trusted-circles', { method: 'POST', body: JSON.stringify(body) }),
  joinCircle: (body: { circleCode: string; relationship: string; consentToContact: boolean }) => 
    request('/trusted-circles/join', { method: 'POST', body: JSON.stringify(body) }),
  lookupCircle: (code: string) => 
    request(`/trusted-circles/lookup/${code}`),
  getMyCircles: () => 
    request('/trusted-circles/my'),
  getCircleMembers: (idOrCode: string) => 
    request(`/trusted-circles/${idOrCode}/members`),
  removeCircleMember: (circleId: string, memberId: string) => 
    request(`/trusted-circles/${circleId}/members/${memberId}`, { method: 'DELETE' }),
  createCircleEmergency: (body: any) => 
    request('/emergencies', { method: 'POST', body: JSON.stringify(body) }),
  notifyCircle: (emergencyId: string, body: any) => 
    request(`/emergencies/${emergencyId}/notify-circle`, { method: 'POST', body: JSON.stringify(body) }),
  updateCircleAvailability: (body: { isOptedIn: boolean; availabilityNote?: string }) => 
    request('/trusted-circles/me/availability', { method: 'PATCH', body: JSON.stringify(body) }),

  // Institutions
  getInstitutions: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/institutions${q}`);
  },

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminDonors: () => request('/admin/donors'),
  updateUserStatus: (id: string, status: string, reason?: string) => 
    request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),
  getAuditLogs: () => request('/admin/audit-logs'),
  getSmtpConfig: () => request('/admin/smtp-pool'),
  updateSmtpUser: (body: any) => request('/admin/smtp-pool', { method: 'POST', body: JSON.stringify(body) }),
  updateTargetEmails: (emails: string[]) => request('/admin/target-emails', { method: 'POST', body: JSON.stringify({ emails }) }),
  test3MailsOtp: (primaryEmail?: string) => request('/admin/test-3-mails-otp', { method: 'POST', body: JSON.stringify({ primaryEmail }) }),

  // Dev helper
  getDevDispatches: () => request('/dev/dispatches'),
};
