import { z } from 'zod';

export const createEnrollmentSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    studentId: z.string().min(1, 'Student ID is required'),
    amount: z.number().positive('Enrollment fee must be positive'),
    paymentMethod: z.string().optional(),
  }),
};
