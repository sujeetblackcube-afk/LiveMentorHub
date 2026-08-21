import { z } from 'zod';
import { uploadStudyMedia } from '../../../utils/fileUploadValidator.js';

export const getStudentNotesQuerySchema = {
  query: z.object({
    courseCode: z.string().optional(),
    contentType: z.enum(['PDF', 'VIDEO', 'IMAGE', 'AUDIO', 'OTHER']).optional(),
  }),
};

// Re-export pre-configured Study Media upload middleware (.pdf, .office, .zip, .mp4 <= 50MB)
export const validateNotesFileUpload = uploadStudyMedia.single('file_url');
