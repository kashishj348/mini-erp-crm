import { z } from 'zod';

export const loginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginDto>;
