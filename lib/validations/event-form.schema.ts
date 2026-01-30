import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string()
    .min(3, 'Event title must be at least 3 characters')
    .max(200, 'Event title must be less than 200 characters'),

  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),

  event_date: z.string()
    .min(1, 'Event date is required'),

  end_date: z.string().optional(),

  location: z.string()
    .max(500, 'Location must be less than 500 characters')
    .optional(),

  wines_theme: z.string()
    .max(500, 'Wines/theme description must be less than 500 characters')
    .optional(),

  price: z.number()
    .min(0, 'Price must be 0 or greater')
    .max(10000, 'Price must be less than $10,000')
    .nullable()
    .optional(),

  max_attendees: z.number()
    .int('Max attendees must be a whole number')
    .min(1, 'Max attendees must be at least 1')
    .max(1000, 'Max attendees must be less than 1000')
    .nullable()
    .optional(),

  is_recurring: z.boolean()
    .optional(),

  recurrence_count: z.number()
    .int('Number of occurrences must be a whole number')
    .min(2, 'Must have at least 2 occurrences')
    .max(104, 'Cannot exceed 104 occurrences (2 years)')
    .nullable()
    .optional(),
}).refine((data) => {
  // If end_date is provided, it should be after event_date
  if (data.end_date && data.event_date) {
    return new Date(data.end_date) >= new Date(data.event_date);
  }
  return true;
}, {
  message: 'End date must be on or after the event date',
  path: ['end_date'],
});

export type EventFormData = z.infer<typeof eventFormSchema>;
