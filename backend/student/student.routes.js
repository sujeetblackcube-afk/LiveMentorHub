/**
 * Student Profile Routes
 * Internal student module for profile management.
 * Public API remains on /api/students and is served by backend/routes/studentRoute.js.
 */

import express from 'express';
import {
  getAllStudents,
  updateStudentStatus,
  getStudentById,
  updateStudentData,
  getStudentCount,
  getStudentLiveSessions,
  getStudentProgress,
  deleteStudent,
  uploadProfile,
} from '../controllers/studentController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/students
 * Get all students
 */
router.get('/', getAllStudents);

/**
 * GET /api/students/count
 * Get total count of students
 */
router.get('/count', getStudentCount);

/**
 * GET /api/students/:studentId
 * Get specific student details
 */
router.get('/:studentId', getStudentById);

/**
 * GET /api/students/:studentId/progress
 * Get student progress (assignments + tests)
 */
router.get('/:studentId/progress', getStudentProgress);

/**
 * PATCH /api/students/:studentId/status
 * Update student status
 */
router.patch('/:studentId/status', updateStudentStatus);

/**
 * PUT /api/students/:studentId
 * Update student profile with image upload
 */
router.put('/:studentId', uploadProfile.single('profileImage'), updateStudentData);

/**
 * GET /api/students/getlive-sessions/:studentId
 * Get live sessions for student
 */
router.get('/getlive-sessions/:studentId', getStudentLiveSessions);

/**
 * DELETE /api/students/delete-account/:studentId
 * Delete student account
 */
router.delete('/delete-account/:studentId', deleteStudent);

export default router;
