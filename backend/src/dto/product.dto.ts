import { z } from 'zod';

export const productCreateDto = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.coerce.number().positive('Unit price must be positive'),
  currentStock: z.coerce.number().int().nonnegative('Stock cannot be negative').optional().default(0),
  minStockAlert: z.coerce.number().int().nonnegative('Minimum stock alert cannot be negative').optional().default(5),
  location: z.string().min(1, 'Location is required')
});

export const productUpdateDto = productCreateDto.partial();

export const productQueryDto = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional()
});

export const stockAdjustmentDto = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be a positive integer'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(1, 'Reason is required')
});

export type ProductCreateInput = z.infer<typeof productCreateDto>;
export type ProductUpdateInput = z.infer<typeof productUpdateDto>;
export type ProductQueryInput = z.infer<typeof productQueryDto>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentDto>;
