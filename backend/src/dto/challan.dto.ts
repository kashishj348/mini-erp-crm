import { z } from 'zod';

export const challanItemDto = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be a positive integer')
});

export const challanCreateDto = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(challanItemDto).min(1, 'At least one item is required')
});

export const challanQueryDto = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional()
});

export type ChallanCreateInput = z.infer<typeof challanCreateDto>;
export type ChallanQueryInput = z.infer<typeof challanQueryDto>;
