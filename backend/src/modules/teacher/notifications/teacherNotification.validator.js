import { z } from 'zod';

export const sendTeacherNotificationSchema = {
  body: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    title: z.string().min(2, 'Title is required'),
    message: z.string().min(5, 'Message is required'),
  }),
};
