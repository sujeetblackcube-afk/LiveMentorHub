import { z } from 'zod';
import { uploadStudyMedia } from '../../../utils/fileUploadValidator.js';

export const createTeacherNotesSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    title: z.string().min(2, 'Notes title is required'),
    description: z.string().optional(),
    contentType: z.enum(['PDF', 'VIDEO', 'IMAGE', 'AUDIO', 'OTHER']).optional(),
    isPublic: z.boolean().optional(),
  }),
};

// Re-export pre-configured Study Media upload middleware (.pdf, .office, .zip, .mp4 <= 50MB)
export const validateTeacherNotesFileUpload = uploadStudyMedia.single('file_url');
