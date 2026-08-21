import { z } from 'zod';

export const createSubjectSchema = {
  body: z.object({
    subjectName: z.string().min(1, 'Subject name is required'),
    subjectCode: z.string().min(1, 'Subject code is required'),
    forClass: z.string().min(1, 'Class association is required (e.g. Class 10)'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

export const updateSubjectSchema = {
  params: z.object({
    id: z.string().or(z.number()),
  }),
  body: z.object({
    subjectName: z.string().optional(),
    subjectCode: z.string().optional(),
    forClass: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};
