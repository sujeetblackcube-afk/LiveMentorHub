import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import { getNotes, streamVideo } from './studentNotes.controller.js';
import {
  addTeacherNote,
  deleteTeacherNote,
  getTeacherNotes,
  getTeacherNoteCount,
  updateTeacherNote,
} from '../../../modules/teacher/notes/teacherNotes.controller.js';
import { validateNotesFileUpload } from './studentNotes.validator.js';

const router = express.Router();

// Streaming video endpoint
router.get('/stream', streamVideo);

router.use(authMiddleware);

// Teacher Note & Image Upload Endpoints under /api/notes
router.post('/', validateNotesFileUpload, addTeacherNote);
router.post('/upload', validateNotesFileUpload, addTeacherNote);
router.put('/:id', updateTeacherNote);
router.delete('/:id', deleteTeacherNote);

// Notes count and listing
router.get('/count', getTeacherNoteCount);
router.get('/teacher', getTeacherNotes);
router.get('/', getNotes);

export default router;
