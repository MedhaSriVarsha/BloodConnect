import { z } from 'zod';

export const donorRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full legal or preferred name must be at least 2 characters.'),
  phone: z
    .string()
    .min(7, 'Please enter a valid primary mobile number.')
    .regex(/^[\d\s+\-()]{7,20}$/, 'Invalid phone number format.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  bloodGroup: z.enum(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']),
  state: z.string().min(1, 'Please select your state.'),
  district: z.string().min(1, 'Please select your district/county.'),
  city: z.string().min(2, 'Please enter your city or locality.'),
  willingness: z.enum(['emergency_only', 'regular', 'plasma_only', 'undecided']).default('regular'),
  
  // Consent MUST NOT be preselected and must be actively checked
  contactSharingConsent: z.boolean().refine((val) => val === true, {
    message: 'Explicit contact-sharing consent is required so emergency coordinators can contact you.',
  }),
  privacyAcknowledged: z.boolean().refine((val) => val === true, {
    message: 'You must review and acknowledge the BloodBridge data privacy policy.',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Savior donor participation terms.',
  }),
  referralCode: z.string().min(3, 'A valid community referral code is required to register.'),
});

export type DonorRegistrationFormData = z.infer<typeof donorRegistrationSchema>;

export const updateDonorProfileSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  bloodGroup: z.enum(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']),
  state: z.string().min(1, 'State is required.'),
  district: z.string().min(1, 'District is required.'),
  city: z.string().min(2, 'City is required.'),
  willingness: z.enum(['emergency_only', 'regular', 'plasma_only', 'undecided']),
  emergencyAvailability: z.boolean(),
  contactSharingConsent: z.boolean(),
});

export type UpdateDonorProfileFormData = z.infer<typeof updateDonorProfileSchema>;
