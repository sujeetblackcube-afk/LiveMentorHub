import { z } from 'zod';

export const createReviewSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().optional(),
  }),
};
