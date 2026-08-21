import { z } from 'zod';

export const createContentSchema = {
  body: z.object({
    key: z.string().min(2, 'Content key is required (e.g. privacy_policy)'),
    title: z.string().min(2, 'Title is required'),
    liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')),
    content: z.string().min(10, 'Content body must be at least 10 characters'),
    targetRole: z.enum(['student', 'teacher', 'parent', 'all']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};
