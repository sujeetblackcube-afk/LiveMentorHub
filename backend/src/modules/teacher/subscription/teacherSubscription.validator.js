import { z } from 'zod';

export const buyTeacherSubscriptionSchema = {
  body: z.object({
    planId: z.number().or(z.string()),
    teacherId: z.string().min(1, 'Teacher ID is required'),
    paymentMethod: z.string().optional(),
  }),
};
