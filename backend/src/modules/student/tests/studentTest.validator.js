import { z } from 'zod';

export const submitStudentTestSchema = {
  body: z.object({
    testId: z.number().or(z.string()),
    studentId: z.string().min(1, 'Student ID is required'),
    answers: z.array(z.any()).min(1, 'Answers array is required'),
    attemptNumber: z.number().optional(),
  }),
};
