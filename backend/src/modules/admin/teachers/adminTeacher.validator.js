import { z } from 'zod';

export const updateTeacherStatusSchema = {
  params: z.object({
    teacherId: z.string().min(1, 'Teacher ID is required'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BLOCKED']),
    verificationNotes: z.string().optional(),
  }),
};
