import express from 'express';
import {
  createDoubt,
  updateDoubt,
  getDoubtsByCourseCode,
  getDoubtsByStudentId,
} from './studentDoubt.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);

// POST / - Create a new doubt
router.post('/', createDoubt);

// GET / - Get all doubts for teacher/user
router.get('/', getDoubtsByCourseCode);

// GET /student/:studentId - Get all doubts by student ID
router.get('/student/:studentId', getDoubtsByStudentId);

// PUT /:id - Update a doubt with teacher reply
router.put('/:id', updateDoubt);

// GET /:teacherId - Get all doubts for a teacher's courses
router.get('/:teacherId', getDoubtsByCourseCode);

export default router;
