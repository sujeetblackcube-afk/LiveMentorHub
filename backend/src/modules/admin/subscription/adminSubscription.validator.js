import { z } from 'zod';

export const createSubscriptionPlanSchema = {
  body: z.object({
    planName: z.string().min(2, 'Plan name is required'),
    planDescription: z.string().optional(),
    price: z.number().nonnegative('Price must be non-negative'),
    durationDays: z.number().positive('Duration in days must be positive'),
    features: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

export const updateSubscriptionPlanSchema = {
  params: z.object({
    id: z.string().or(z.number()),
  }),
  body: z.object({
    planName: z.string().optional(),
    planDescription: z.string().optional(),
    price: z.number().nonnegative().optional(),
    durationDays: z.number().positive().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};
