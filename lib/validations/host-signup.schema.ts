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

  clubAddress: z.string()
    .min(10, 'Please provide a complete club address')
    .max(500, 'Club address must be less than 500 characters'),

  aboutClub: z.string()
    .max(500, 'About club must be less than 500 characters')
    .optional(),

  winePreferences: z.string()
    .max(500, 'Wine preferences must be less than 500 characters')
    .optional(),

  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type HostSignupFormData = z.infer<typeof hostSignupSchema>;
