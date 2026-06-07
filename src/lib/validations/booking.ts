import { z } from 'zod';

export const bookingRequestSchema = z.object({
  customerName: z.string().min(2, 'Name is required').max(80),
  customerPhone: z.string().min(8, 'Phone number is required').max(20),
  address: z.string().min(8, 'Address is required').max(300),
  serviceId: z.string().optional(),
  preferredDate: z.string().min(1, 'Date is required'),
  preferredTime: z.string().min(1, 'Time is required'),
  notes: z.string().max(500).optional(),
  source: z.string().max(80).optional()
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
