import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getNotes,
  streamVideo,
} from '../../../modules/student/notes/studentNotesLegacy.controller.js';
import { getTeacherNoteCount } from '../../../modules/teacher/notes/teacherNotes.controller.js';

const router = express.Router();

// Add the streaming endpoint (Public route for <video> tags)
router.get('/stream', streamVideo);

router.use(authMiddleware);

// Get notes count
router.get('/count', getTeacherNoteCount);

// Get notes for student
router.get('/', getNotes);

export default router;
