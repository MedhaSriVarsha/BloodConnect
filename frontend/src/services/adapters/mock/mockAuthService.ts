import type { AuthService } from '../contracts';
import type {
  AuthSession,
  LoginCredentials,
  RegisterInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../../../types/auth';
import { mockStore, delay } from './mockStore';

export class MockAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(300);

    const isIdentifierAdmin = credentials.identifier.toLowerCase().includes('admin');
    const user = isIdentifierAdmin ? mockStore.adminUser : (mockStore.currentUser || {
      id: 'usr_demo_custom',
      name: 'Demo Donor',
      phone: credentials.identifier.includes('@') ? '+1 (555) 019-2834' : credentials.identifier,
      email: credentials.identifier.includes('@') ? credentials.identifier : 'demo.donor@bloodbridge.org',
      role: 'donor',
      referralCode: 'SAVIOR-DEMO',
      createdAt: new Date().toISOString(),
      isVerified: true,
    });

    mockStore.currentUser = user;

    const session: AuthSession = {
      user,
      token: `demo_token_${user.role}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    localStorage.setItem('bloodbridge_demo_session', JSON.stringify(session));
    return session;
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    await delay(350);

    const newUser = {
      id: `usr_${Date.now()}`,
      name: input.name,
      phone: input.phone,
      email: input.email,
      role: 'donor' as const,
      referralCode: `SAVIOR-${input.name.split(' ')[0].toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      isVerified: false, // OTP step follows
    };

    mockStore.currentUser = newUser;

    const session: AuthSession = {
      user: newUser,
      token: `demo_token_donor_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    localStorage.setItem('bloodbridge_demo_session', JSON.stringify(session));
    return session;
  }

  async verifyOtp(input: VerifyOtpInput): Promise<boolean> {
    await delay(250);
    // In demo mode, accept standard '123456' or any 6-digit code
    if (input.code.length === 6) {
      if (mockStore.currentUser) {
        mockStore.currentUser.isVerified = true;
      }
      return true;
    }
    throw {
      code: 'INVALID_OTP',
      message: 'Demo Verification Notice: Please enter any valid 6-digit code (e.g., 123456) to proceed.',
    };
  }

  async requestOtp(phone: string): Promise<{ success: boolean; message: string }> {
    await delay(200);
    return {
      success: true,
      message: `[Demo Mode] Simulated OTP code (123456) generated for ${phone}. No real SMS was transmitted.`,
    };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ success: boolean; message: string }> {
    await delay(250);
    return {
      success: true,
      message: `[Demo Mode] Simulated password recovery link generated for ${input.identifier}. No real email sent.`,
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
    await delay(300);
    return {
      success: true,
      message: 'Password reset simulation successful. You may now log in with your updated credentials.',
    };
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    await delay(100);
    const stored = localStorage.getItem('bloodbridge_demo_session');
    if (stored) {
      try {
        const session = JSON.parse(stored) as AuthSession;
        if (session.user) {
          mockStore.currentUser = session.user;
          return session;
        }
      } catch {
        localStorage.removeItem('bloodbridge_demo_session');
      }
    }
    // Default demo session is Marcus Vance
    if (mockStore.currentUser) {
      return {
        user: mockStore.currentUser,
        token: 'demo_token_marcus_vance',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
    }
    return null;
  }

  async logout(): Promise<void> {
    await delay(150);
    localStorage.removeItem('bloodbridge_demo_session');
    mockStore.currentUser = null;
  }
}

export const mockAuthService = new MockAuthService();
