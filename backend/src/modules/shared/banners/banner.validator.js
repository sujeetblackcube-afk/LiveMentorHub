import { z } from 'zod';
import { uploadImage } from '../../../utils/fileUploadValidator.js';

export const createBannerSchema = {
  body: z.object({
    title: z.string().optional(),
    redirectUrl: z.string().url('Invalid redirect URL format').optional().or(z.literal('')),
    targetRole: z.enum(['student', 'teacher', 'parent', 'all']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

// Re-export pre-configured image uploader middleware for Banners (.jpg, .png, .webp <= 5MB)
export const validateBannerImage = uploadImage.single('image_url');
