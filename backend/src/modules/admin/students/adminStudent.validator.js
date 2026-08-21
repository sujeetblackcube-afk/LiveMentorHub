import { z } from 'zod';

export const updateStudentStatusSchema = {
  params: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BLOCKED']),
    remarks: z.string().optional(),
  }),
};
