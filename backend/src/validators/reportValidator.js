import { z } from 'zod';
import mongoose from 'mongoose';

export const createReportSchema = z.object({
  resourceId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid resource ID'
  }),
  resourceTitle: z.string().optional().default(''),
  issueType: z.enum(['broken_link', 'incorrect_content', 'outdated_syllabus', 'other']).default('broken_link'),
  description: z.string().trim().max(1000).optional().default('')
});
