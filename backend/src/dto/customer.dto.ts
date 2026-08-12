import { z } from 'zod';

export const customerCreateDto = z.object({
  name: z.string().min(1, 'Customer name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Invalid email format'),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(1, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
  followUpDate: z.coerce.date().optional().nullable()
});

export const customerUpdateDto = customerCreateDto.partial();

export const customerQueryDto = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional()
});

export const followUpCreateDto = z.object({
  note: z.string().min(1, 'Follow-up note is required')
});

export type CustomerCreateInput = z.infer<typeof customerCreateDto>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateDto>;
export type CustomerQueryInput = z.infer<typeof customerQueryDto>;
export type FollowUpCreateInput = z.infer<typeof followUpCreateDto>;
