import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  fetchAllTestsForStudent,
  submitTestByStudent,
} from '../../controllers/testController.js';
import {
  getTeacherTestSubmissions,
  updateTeacherTestSubmissionMarks,
} from '../../teacher/tests/teacherTest.controller.js';

const router = express.Router();

router.use(authMiddleware);

// Teacher test submission endpoints
router.get('/:teacherId/test-submissions', getTeacherTestSubmissions);
router.put('/grade-submission/:submissionId', updateTeacherTestSubmissionMarks);

// Fetch all tests for a student
router.get('/:studentId', fetchAllTestsForStudent);

// Submit test by student
router.post('/submit', submitTestByStudent);

export default router;
