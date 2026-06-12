import { z } from 'zod';

export const bookingRequestSchema = z.object({
  customerName: z.string().min(2, 'Name is required').max(80),
  customerPhone: z.string().min(8, 'Phone number is required').max(20).regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Enter a valid Bangladesh phone number'),
  address: z.string().min(8, 'Address is required').max(300),
  serviceId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(10).optional(),
  applianceType: z.string().max(80).optional(),
  applianceCapacity: z.string().max(80).optional(),
  selectedAddons: z.array(z.string().max(80)).max(10).optional(),
  estimatedPrice: z.coerce.number().int().nonnegative().optional(),
  preferredDate: z.string().min(1, 'Date is required'),
  preferredTime: z.string().min(1, 'Time is required'),
  notes: z.string().max(2000).optional(),
  source: z.string().max(80).optional()
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const adminBookingCreateSchema = bookingRequestSchema.extend({
  source: z.enum(['admin', 'phone', 'website']).default('admin'),
  createStatus: z.enum(['pending', 'confirmed']).default('pending')
});

export type AdminBookingCreateInput = z.infer<typeof adminBookingCreateSchema>;

export const adminBookingUpdateSchema = z.object({
  customerName: z.string().min(2, 'Name is required').max(80),
  customerPhone: z.string().min(8, 'Phone number is required').max(20).regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Enter a valid Bangladesh phone number'),
  address: z.string().min(8, 'Address is required').max(300),
  serviceId: z.string().optional(),
  preferredDate: z.string().min(1, 'Date is required'),
  preferredTime: z.string().min(1, 'Time is required'),
  notes: z.string().max(2000).optional(),
  finalPrice: z.coerce.number().int().positive().optional().or(z.literal(''))
});

export type AdminBookingUpdateInput = z.infer<typeof adminBookingUpdateSchema>;
