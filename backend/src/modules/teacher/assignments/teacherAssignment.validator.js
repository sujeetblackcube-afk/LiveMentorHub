import { z } from 'zod';
import { uploadStudyMedia } from '../../../utils/fileUploadValidator.js';

export const createAssignmentSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    title: z.string().min(2, 'Assignment title is required'),
    description: z.string().min(5, 'Description is required'),
    dueDate: z.string().datetime('Invalid due date ISO format'),
    totalMarks: z.number().min(1, 'Total marks required'),
  }),
};

// Re-export pre-configured Study Media upload middleware (.pdf, .office, .zip, .mp4 <= 50MB)
export const validateAssignmentFileUpload = uploadStudyMedia.single('file');
