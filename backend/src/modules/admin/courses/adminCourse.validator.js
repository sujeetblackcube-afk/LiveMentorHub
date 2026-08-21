import { z } from 'zod';
import { uploadImage } from '../../../utils/fileUploadValidator.js';

export const createCourseSchema = {
  body: z.object({
    courseName: z.string().min(2, 'Course name is required'),
    courseCode: z.string().min(2, 'Course code is required'),
    courseType: z.enum(['ACADEMIC', 'NON_ACADEMIC']),
    mrp: z.number().positive('MRP must be positive'),
    discountedPrice: z.number().nonnegative('Discounted price cannot be negative'),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  }),
};

export const updateCourseSchema = {
  params: z.object({
    courseCode: z.string().min(1, 'Course code parameter is required'),
  }),
  body: z.object({
    courseName: z.string().optional(),
    mrp: z.number().positive().optional(),
    discountedPrice: z.number().nonnegative().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  }),
};

// Re-export pre-configured image uploader middleware for Course Thumbnails (.jpg, .png, .webp <= 5MB)
export const validateCourseThumbnail = uploadImage.single('thumbnail');
