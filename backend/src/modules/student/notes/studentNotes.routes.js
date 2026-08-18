import express from 'express';
import multer from 'multer';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getNotes,
  streamVideo,
} from '../../../modules/student/notes/studentNotesLegacy.controller.js';
import {
  addTeacherNote,
  deleteTeacherNote,
  getTeacherNotes,
  getTeacherNoteCount,
  updateTeacherNote,
} from '../../../modules/teacher/notes/teacherNotes.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Streaming video endpoint
router.get('/stream', streamVideo);

router.use(authMiddleware);

// Teacher Note & Image Upload Endpoints under /api/notes
router.post('/', upload.single('file'), addTeacherNote);
router.post('/upload', upload.single('file'), addTeacherNote);
router.put('/:id', updateTeacherNote);
router.delete('/:id', deleteTeacherNote);

// Notes count and listing
router.get('/count', getTeacherNoteCount);
router.get('/teacher', getTeacherNotes);
router.get('/', getNotes);

export default router;
