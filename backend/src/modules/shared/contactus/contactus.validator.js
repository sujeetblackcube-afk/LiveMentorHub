import { z } from 'zod';

export const createContactUsTicketSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().optional(),
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    message: z.string().min(5, 'Message must be at least 5 characters'),
    role: z.enum(['student', 'teacher', 'parent', 'guest']).optional(),
  }),
};
