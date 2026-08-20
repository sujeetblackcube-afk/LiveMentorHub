/**
 * Unified Student Module Router
 * Mounts public (unauthenticated) & protected student endpoints.
 * Public routes: /home, /coursepagedata
 * Protected routes: profile, doubts, tests, assignments, enrollments, notifications
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
} from './student.controller.js';
import { getHomeData } from '../../androidcontrollers/homecontrollers.js';
import {
  getCoursePageData,
  getCoursesBySubject,
  getNotesByStudent,
} from '../../androidcontrollers/coursepagedataController.js';
import {
  createDoubt,
  getDoubtsByStudentId,
} from './doubts/studentDoubt.controller.js';
import {
  fetchAllTestsForStudent,
  submitTestByStudent,
} from './tests/studentTestLegacy.controller.js';
import {
  getStudentAssignments,
  submitAssignment,
} from '../teacher/assignments/assignmentLegacy.controller.js';
import {
  getEnrollmentsByStudentId,
  createCashfreeOrder,
} from './enrollments/studentEnrollment.controller.js';
import {
  getStudentNotifications,
  deleteNotification,
  deleteAllNotifications,
} from '../admin/notifications/adminNotification.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// ============================================================
// 1️⃣ PUBLIC UNAUTHENTICATED STUDENT ROUTES (Anyone can access)
// ============================================================
router.get('/home', getHomeData);
router.get('/home/:studentId', getHomeData);

router.get('/coursepagedata', getCoursePageData);
router.get('/coursepagedata/:studentId', getCoursePageData);
router.get('/coursepagedata/:studentId/subject/:subjectCode', getCoursesBySubject);
router.get('/coursepagedata/:studentId/:courseCode/content', getNotesByStudent);

// ============================================================
// 2️⃣ PROTECTED STUDENT ROUTES (Require Authentication)
// ============================================================
router.use(authMiddleware);

// Profile & Progress
router.get('/', getAllStudents);
router.get('/count', getStudentCount);
router.get('/:studentId', getStudentById);
router.get('/:studentId/progress', getStudentProgress);
router.patch('/:studentId/status', updateStudentStatus);
router.put('/:studentId', uploadProfile.single('profileImage'), updateStudentData);
router.get('/getlive-sessions/:studentId', getStudentLiveSessions);
router.delete('/delete-account/:studentId', deleteStudent);

// Doubts
router.get('/doubts/student/:studentId', getDoubtsByStudentId);
router.post('/doubts', createDoubt);

// Tests
router.get('/tests/student/:studentId', fetchAllTestsForStudent);
router.post('/tests/submit', submitTestByStudent);

// Assignments
router.get('/assignments/student/:studentId', getStudentAssignments);
router.post('/assignments/students/submission', submitAssignment);

// Enrollments & Cashfree
router.get('/enrollments/student/:studentId', getEnrollmentsByStudentId);
router.post('/enrollments/create-cashfree-order', createCashfreeOrder);

// Notifications (Supporting both /student/:studentId/all AND /student/all/:studentId)
router.get('/notifications/student/:studentId', getStudentNotifications);
router.delete('/notifications/student/:notificationId', deleteNotification);
router.delete('/notifications/student/:studentId/all', deleteAllNotifications);
router.delete('/notifications/student/all/:studentId', deleteAllNotifications);

export default router;
