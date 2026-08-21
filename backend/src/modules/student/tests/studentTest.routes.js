import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  fetchAllTestsForStudent,
  submitTestByStudent,
} from './studentTest.controller.js';
import {
  createTeacherTest,
  getTeacherTests,
  getTeacherTestById,
  updateTeacherTest,
  deleteTeacherTest,
  getTeacherTestSubmissions,
  updateTeacherTestSubmissionMarks,
} from '../../../modules/teacher/tests/teacherTest.controller.js';

const router = express.Router();

router.use(authMiddleware);

// Teacher Test Management Endpoints under /api/tests
router.get('/', (req, res, next) => {
  if (req.query.teacherId) {
    return getTeacherTests(req, res, next);
  }
  next();
});
router.post('/', createTeacherTest);
router.put('/:id', updateTeacherTest);
router.delete('/:id', deleteTeacherTest);

// Teacher test submission endpoints
router.get('/teacher/:teacherId', getTeacherTests);
router.get('/:teacherId/test-submissions', getTeacherTestSubmissions);
router.put('/grade-submission/:submissionId', updateTeacherTestSubmissionMarks);

// Student Test Endpoints
router.get('/student/:studentId', fetchAllTestsForStudent);
router.get('/:studentId', fetchAllTestsForStudent);
router.post('/submit', submitTestByStudent);

export default router;
