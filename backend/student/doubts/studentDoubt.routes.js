import express from 'express';
import {
  createDoubt,
  updateDoubt,
  getDoubtsByCourseCode,
  getDoubtsByStudentId,
} from '../../controllers/doubtController.js';
import authMiddleware from '../../middleware/authmiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// POST /api/doubts - Create a new doubt
router.post('/', createDoubt);

// GET /api/doubts/student/:studentId - Get all doubts by student ID
router.get('/student/:studentId', getDoubtsByStudentId);

// PUT /api/doubts/:id - Update a doubt with teacher reply
router.put('/:id', updateDoubt);

// GET /api/doubts/:teacherId - Get all doubts for a teacher's courses
router.get('/:teacherId', getDoubtsByCourseCode);

export default router;
