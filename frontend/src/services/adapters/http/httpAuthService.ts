import type { AuthService } from '../contracts';
import type {
  AuthSession,
  LoginCredentials,
  RegisterInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserRole,
} from '../../../types/auth';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

export class HttpAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const raw = await apiClient.post<any>(ENDPOINTS.LOGIN, {
      identifier: credentials.identifier,
      password: credentials.password || credentials.otp || 'password123',
    });

    const resData = raw?.data || raw;
    const rawUser = resData?.user || resData;
    const token = resData?.tokens?.accessToken || resData?.token || raw?.token || 'dev-token';

    const role: UserRole = (rawUser?.roles?.includes('ADMIN') || rawUser?.role === 'admin') ? 'admin' : 'donor';

    const session: AuthSession = {
      user: {
        id: rawUser?.id || `usr-${Date.now()}`,
        name: rawUser?.fullName || rawUser?.name || 'User',
        phone: rawUser?.phone || '',
        email: rawUser?.email || '',
        role,
        avatarUrl: rawUser?.avatarUrl,
        referralCode: resData?.referralCode || rawUser?.referralCode,
        createdAt: rawUser?.createdAt || new Date().toISOString(),
        isVerified: rawUser?.status === 'ACTIVE' || Boolean(rawUser?.isVerified),
      },
      token,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    apiClient.setToken(session.token);
    localStorage.setItem('bloodbridge_auth_token', session.token);
    return session;
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    const payload = {
      fullName: input.name,
      email: input.email || `${input.phone.replace(/\D/g, '')}@bloodconnect.temp`,
      phone: input.phone,
      password: input.password || 'SecurePassword123!',
      consent: input.termsAccepted ?? true,
      referralCode: input.referralCodeUsed,
    };

    const raw = await apiClient.post<any>(ENDPOINTS.REGISTER, payload);
    const resData = raw?.data || raw;
    const rawUser = resData?.user || resData;
    const token = resData?.tokens?.accessToken || resData?.token || `token-${Date.now()}`;

    const session: AuthSession = {
      user: {
        id: resData?.userId || rawUser?.id || `usr-${Date.now()}`,
        name: input.name,
        phone: input.phone,
        email: input.email,
        role: 'donor',
        referralCode: input.referralCodeUsed,
        createdAt: new Date().toISOString(),
        isVerified: false,
      },
      token,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    apiClient.setToken(session.token);
    localStorage.setItem('bloodbridge_auth_token', session.token);
    return session;
  }

  async verifyOtp(input: VerifyOtpInput): Promise<boolean> {
    const isEmail = input.phone.includes('@');
    const endpoint = isEmail ? '/auth/verify-email' : '/auth/verify-phone';
    const purpose = isEmail ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';

    try {
      const raw = await apiClient.post<any>(endpoint, {
        destination: input.phone,
        otp: input.code,
        purpose,
      });
      return raw?.status === 'success' || raw?.data?.phoneVerified === true || raw?.verified === true;
    } catch (err: any) {
      try {
        const raw = await apiClient.post<any>(ENDPOINTS.VERIFY_OTP, input);
        return raw?.verified === true || raw?.status === 'success';
      } catch {
        throw err;
      }
    }
  }

  async requestOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const isEmail = phone.includes('@');
    const purpose = isEmail ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';
    try {
      const res = await apiClient.post<any>('/auth/otp/resend', {
        destination: phone,
        purpose,
      });
      return {
        success: true,
        message: res?.message || 'Verification code dispatched successfully.',
      };
    } catch {
      return apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.REQUEST_OTP, { phone });
    }
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.FORGOT_PASSWORD, input);
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.RESET_PASSWORD, input);
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const token = localStorage.getItem('bloodbridge_auth_token');
    if (!token) return null;

    try {
      apiClient.setToken(token);
      const raw = await apiClient.get<any>(ENDPOINTS.ME);
      const resData = raw?.data || raw;
      const rawUser = resData?.user || resData;
      if (!rawUser) return null;

      const role: UserRole = (rawUser?.roles?.includes('ADMIN') || rawUser?.role === 'admin') ? 'admin' : 'donor';

      return {
        user: {
          id: rawUser.id,
          name: rawUser.fullName || rawUser.name || 'User',
          phone: rawUser.phone || '',
          email: rawUser.email || '',
          role,
          avatarUrl: rawUser.avatarUrl,
          referralCode: resData.referralCode || rawUser.referralCode,
          createdAt: rawUser.createdAt || new Date().toISOString(),
          isVerified: rawUser.status === 'ACTIVE' || Boolean(rawUser.isVerified),
        },
        token,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch {
      localStorage.removeItem('bloodbridge_auth_token');
      apiClient.setToken(null);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.LOGOUT);
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('bloodbridge_auth_token');
      apiClient.setToken(null);
    }
  }
}

export const httpAuthService = new HttpAuthService();
