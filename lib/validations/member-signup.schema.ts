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

  // Optional location fields for when findNearbyHosts is true
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip_code: z.string().optional().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.hostCode || data.findNearbyHosts, {
  message: 'Please enter a host code or select find nearby hosts',
  path: ['hostCode'],
}).refine((data) => {
  // If findNearbyHosts is true, require location data
  if (data.findNearbyHosts) {
    return !!data.address && !!data.latitude && !!data.longitude;
  }
  return true;
}, {
  message: 'Please select your address to find nearby hosts',
  path: ['address'],
});

export type MemberSignupFormData = z.infer<typeof memberSignupSchema>;
