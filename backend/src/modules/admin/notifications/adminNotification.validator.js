import { z } from 'zod';

export const sendBroadcastNotificationSchema = {
  body: z.object({
    title: z.string().min(2, 'Notification title is required'),
    message: z.string().min(5, 'Message body is required'),
    targetRole: z.enum(['student', 'teacher', 'parent', 'all']),
    actionUrl: z.string().url().optional().or(z.literal('')),
  }),
};
