import { z } from 'zod';

export const createClassSchema = {
  body: z.object({
    className: z.string().min(1, 'Class name is required (e.g. Class 10)'),
    classDescription: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

export const updateClassSchema = {
  params: z.object({
    id: z.string().or(z.number()),
  }),
  body: z.object({
    className: z.string().optional(),
    classDescription: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};
