import { z } from 'zod';

export const createTeacherTestSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    teacherId: z.string().min(1, 'Teacher ID is required'),
    title: z.string().min(2, 'Test title is required'),
    questions: z.array(z.any()).min(1, 'Questions array is required'),
    totalMarks: z.number().positive('Total marks must be positive'),
    durationMinutes: z.number().positive('Duration must be positive'),
  }),
};
