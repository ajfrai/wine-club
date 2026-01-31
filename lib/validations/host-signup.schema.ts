import { z } from 'zod';

export const hostSignupSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),

  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  confirmPassword: z.string(),

  clubType: z.enum(['fixed', 'multi_host']),

  clubAddress: z.string()
    .max(500, 'Club address must be less than 500 characters')
    .optional()
    .or(z.literal('')), // Allow empty string for multi-host clubs

  aboutClub: z.string()
    .max(500, 'About club must be less than 500 characters')
    .optional(),

  winePreferences: z.string()
    .max(500, 'Wine preferences must be less than 500 characters')
    .optional(),

  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
.refine((data) => {
  // For fixed clubs, address is required and must be at least 10 characters
  if (data.clubType === 'fixed') {
    if (!data.clubAddress || data.clubAddress.trim().length < 10) {
      return false;
    }
  }
  return true;
}, {
  message: 'Please provide a complete club address (at least 10 characters)',
  path: ['clubAddress'],
});

export type HostSignupFormData = z.infer<typeof hostSignupSchema>;
