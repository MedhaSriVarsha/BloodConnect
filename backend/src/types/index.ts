import { Request } from 'express';

export type UserRoleType = 'DONOR' | 'RECIPIENT' | 'HOSPITAL_STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export type BloodGroupType = 
  | 'A_POSITIVE' | 'A_NEGATIVE' 
  | 'B_POSITIVE' | 'B_NEGATIVE' 
  | 'AB_POSITIVE' | 'AB_NEGATIVE' 
  | 'O_POSITIVE' | 'O_NEGATIVE' 
  | 'OH_BOMBAY';

export type UrgencyType = 'LOW' | 'NORMAL' | 'URGENT' | 'CRITICAL';
export type BloodRequestStatusType = 'OPEN' | 'MATCHING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';

export interface AuthenticatedUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  roles: UserRoleType[];
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  requestId?: string;
}

export interface OtpVerificationRecord {
  id: string;
  userId?: string;
  purpose: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'LOGIN_MFA' | 'PASSWORD_RESET';
  destination: string;
  codeMac: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  consumedAt?: Date | null;
  createdAt: Date;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  nextEligibleDate: string;
  metrics: {
    weightOk: boolean;
    ageOk: boolean;
    intervalOk: boolean;
    medicalOk: boolean;
  };
}
