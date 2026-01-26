import { z } from 'zod';

export const memberSignupSchema = z.object({
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

  hostCode: z.string()
    .length(8, 'Host code must be exactly 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Host code must contain only uppercase letters and numbers')
    .optional()
    .or(z.literal('')),

  findNearbyHosts: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.hostCode || data.findNearbyHosts, {
  message: 'Please enter a host code or select find nearby hosts',
  path: ['hostCode'],
});

export type MemberSignupFormData = z.infer<typeof memberSignupSchema>;
