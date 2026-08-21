import { z } from 'zod';

export const getTeacherCourseQuerySchema = {
  query: z.object({
    teacherId: z.string().optional(),
    courseType: z.enum(['ACADEMIC', 'NON_ACADEMIC']).optional(),
  }),
};
