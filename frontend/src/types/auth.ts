export type UserRole = 'donor' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  referralCode?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  identifier: string; // phone or email
  password?: string;
  otp?: string;
}

export interface RegisterInput {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  termsAccepted: boolean;
  privacyAcknowledged: boolean;
  referralCodeUsed?: string;
}

export interface VerifyOtpInput {
  phone: string;
  code: string;
}

export interface ForgotPasswordInput {
  identifier: string;
}

export interface ResetPasswordInput {
  identifier: string;
  code: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mode: 'demo' | 'api';
}
