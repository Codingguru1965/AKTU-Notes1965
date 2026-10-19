import { z } from 'zod';
import { RESOURCE_TYPES, SEMESTER_YEAR_MAP } from '../config/constants.js';
import { validateStorageUrl } from '../services/storageService.js';

export const createResourceSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  resourceType: z.enum(RESOURCE_TYPES, { errorMap: () => ({ message: 'Invalid resource type' }) }),
  branch: z.string().trim().min(2, 'Branch must be at least 2 characters').max(30),
  year: z.coerce.number().int().min(1).max(4),
  semester: z.coerce.number().int().min(1).max(8),
  subjectCode: z.string().trim().min(2).max(25),
  subjectName: z.string().trim().min(2).max(120),
  fileUrl: z.string().trim().min(1, 'File URL is required').refine(val => {
    if (val.startsWith('/uploads/')) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid URL format' }),
  university: z.string().trim().max(100).optional().default('AKTU'),
  academicYear: z.string().trim().max(30).optional().default(''),
  regulation: z.string().trim().max(40).optional().default(''),
  description: z.string().trim().max(2000).optional().default(''),
  isPublished: z.boolean().optional().default(false)
}).superRefine((data, ctx) => {
  const expectedYear = SEMESTER_YEAR_MAP[data.semester];
  if (expectedYear !== data.year) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['semester'],
      message: `Semester ${data.semester} belongs to Year ${expectedYear}, not Year ${data.year}`
    });
  }

  const urlCheck = validateStorageUrl(data.fileUrl);
  if (!urlCheck.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['fileUrl'],
      message: urlCheck.reason
    });
  }
});

export const updateResourceSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  resourceType: z.enum(RESOURCE_TYPES).optional(),
  branch: z.string().trim().min(2).max(30).optional(),
  year: z.coerce.number().int().min(1).max(4).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  subjectCode: z.string().trim().min(2).max(25).optional(),
  subjectName: z.string().trim().min(2).max(120).optional(),
  fileUrl: z.string().trim().min(1).refine(val => {
    if (val.startsWith('/uploads/')) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid URL format' }).optional(),
  university: z.string().trim().max(100).optional(),
  academicYear: z.string().trim().max(30).optional(),
  regulation: z.string().trim().max(40).optional(),
  description: z.string().trim().max(2000).optional(),
  isPublished: z.boolean().optional()
}).superRefine((data, ctx) => {
  if (data.year && data.semester) {
    const expectedYear = SEMESTER_YEAR_MAP[data.semester];
    if (expectedYear !== data.year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['semester'],
        message: `Semester ${data.semester} belongs to Year ${expectedYear}, not Year ${data.year}`
      });
    }
  }

  if (data.fileUrl) {
    const urlCheck = validateStorageUrl(data.fileUrl);
    if (!urlCheck.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fileUrl'],
        message: urlCheck.reason
      });
    }
  }
});

export const resourceQuerySchema = z.object({
  branch: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  year: z.coerce.number().int().min(1).max(4).optional(),
  resourceType: z.enum(RESOURCE_TYPES).optional(),
  subjectCode: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});
