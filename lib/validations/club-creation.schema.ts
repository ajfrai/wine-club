import { z } from 'zod';

export const clubCreationSchema = z.object({
  clubName: z.string()
    .min(2, 'Club name must be at least 2 characters')
    .max(100, 'Club name must be less than 100 characters'),

  clubType: z.enum(['fixed', 'multi_host']),

  clubAddress: z.string()
    .min(10, 'Please provide a complete club address')
    .max(500, 'Club address must be less than 500 characters')
    .optional(),

  aboutClub: z.string()
    .max(500, 'About club must be less than 500 characters')
    .optional(),

  winePreferences: z.string()
    .max(500, 'Wine preferences must be less than 500 characters')
    .optional(),

  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
})
.refine((data) => {
  // For fixed clubs, address is required
  if (data.clubType === 'fixed' && !data.clubAddress) {
    return false;
  }
  return true;
}, {
  message: 'Club address is required for fixed location clubs',
  path: ['clubAddress'],
});

export type ClubCreationFormData = z.infer<typeof clubCreationSchema>;
