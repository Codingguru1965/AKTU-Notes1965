import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password is required')
});
