import { z } from 'zod';
import { uploadStudyMedia } from '../../../utils/fileUploadValidator.js';

export const createDoubtSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    title: z.string().min(2, 'Doubt title is required'),
    description: z.string().min(5, 'Description is required'),
    teacherId: z.string().optional(),
  }),
};

// Re-export pre-configured Study Media uploader middleware (.jpg, .png, .pdf <= 50MB)
export const validateDoubtMedia = uploadStudyMedia.single('media_url');
