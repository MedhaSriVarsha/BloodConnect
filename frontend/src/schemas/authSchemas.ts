import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Please enter a valid phone number or email address.')
    .refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^[\d\s+\-()]{7,20}$/.test(val);
      return isEmail || isPhone;
    }, 'Enter a valid email address or phone number (e.g. +1 555-019-2834).'),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters.'),
    phone: z
      .string()
      .min(7, 'Please enter a valid phone number.')
      .regex(/^[\d\s+\-()]{7,20}$/, 'Invalid phone number format.'),
    email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z.string().min(8, 'Please confirm your password.'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service to join.',
    }),
    privacyAcknowledged: z.boolean().refine((val) => val === true, {
      message: 'You must acknowledge the Privacy Policy.',
    }),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits.')
    .regex(/^\d{6}$/, 'Code must contain numbers only.'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Please provide your registered phone or email.'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Enter the 6-digit verification code.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
    confirmPassword: z.string().min(8, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
