import { z } from 'zod';
import { uploadSyllabus } from '../../../utils/fileUploadValidator.js';

export const createSyllabusSchema = {
  body: z.object({
    courseCode: z.string().min(1, 'Course code is required'),
    introVideoUrl: z.string().url('Invalid video URL').optional().or(z.literal('')),
    syllabusPoints: z.array(z.string()).optional(),
  }),
};

// Re-export pre-configured Syllabus upload middleware (.pdf, .doc, .docx <= 15MB)
export const validateSyllabusFile = uploadSyllabus.single('syllabus_url');
