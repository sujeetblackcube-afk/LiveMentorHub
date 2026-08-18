/**
 * Teacher tests routes.
 * Internal refactor route. Public route remains /api/tests.
 */

import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  createTeacherTest,
  getTeacherTests,
  getTeacherTestById,
  updateTeacherTest,
  deleteTeacherTest,
  getTeacherTestSubmissions,
  updateTeacherTestSubmissionMarks,
} from './teacherTest.controller.js';

const router = express.Router();

const requireTeacherRole = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required',
    });
  }

  next();
};

router.use(authMiddleware);
router.use(requireTeacherRole);

router.post('/', createTeacherTest);
router.get('/', getTeacherTests);
router.get('/:id', getTeacherTestById);
router.get('/course/:courseCode', async (req, res) => {
  const { getTeacherTests } = await import('./teacherTest.controller.js');
  return getTeacherTests(req, res);
});
router.put('/:id', updateTeacherTest);
router.delete('/:id', deleteTeacherTest);
router.get('/:teacherId/test-submissions', getTeacherTestSubmissions);
router.put('/grade-submission/:submissionId', updateTeacherTestSubmissionMarks);

export default router;
