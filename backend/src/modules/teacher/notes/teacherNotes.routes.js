/**
 * Teacher notes routes.
 * Internal refactor route. Public route remains /api/notes.
 */

import express from 'express';
import multer from 'multer';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  addTeacherNote,
  deleteTeacherNote,
  getTeacherNotes,
  getTeacherNoteCount,
  updateTeacherNote,
  streamTeacherNote,
} from './teacherNotes.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);
router.get('/stream', streamTeacherNote);
router.post('/', upload.single('file'), addTeacherNote);
router.get('/', getTeacherNotes);
router.put('/:id', updateTeacherNote);
router.delete('/:id', deleteTeacherNote);
router.get('/count', getTeacherNoteCount);

export default router;
