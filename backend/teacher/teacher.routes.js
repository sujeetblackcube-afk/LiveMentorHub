/**
 * Internal teacher module aggregator.
 * Public API remains on /api/teachers and is served by backend/routes/teacherRoute.js.
 */

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import courseRoutes from './courses/teacherCourse.routes.js';
import testRoutes from './tests/teacherTest.routes.js';
import noteRoutes from './notes/teacherNotes.routes.js';
import subscriptionRoutes from './subscription/teacherSubscription.routes.js';
import assignmentRoutes from './assignments/teacherAssignment.routes.js';
import liveSessionRoutes from './livesessions/teacherLiveSession.routes.js';
import notificationRoutes from './notifications/teacherNotification.routes.js';
import {
  getAllTeachers,
  updateTeacherStatus,
  getTeacherCount,
  updateCoursename,
  getTeacherProfile,
  getTeacherCourses,
  getTeacherCourseStudents,
  getTeacherLiveSessions,
  courseCountForTeacher,
  getTotalStudentCountForTeacher,
  updateTeacherProfile,
  deleteTeacher,
} from './teacherProfile.controller.js';
import authMiddleware from '../middleware/authmiddleware.js';

// Keep the same file locations as the legacy implementation.
const teacherProfileDir = path.join(process.cwd(), 'uploads', 'teacher-profiles');
const teacherDocDir = path.join(process.cwd(), 'uploads', 'teacher-documents');
if (!fs.existsSync(teacherProfileDir)) fs.mkdirSync(teacherProfileDir, { recursive: true });
if (!fs.existsSync(teacherDocDir)) fs.mkdirSync(teacherDocDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, 'uploads/teacher-profiles/');
    } else {
      cb(null, 'uploads/teacher-documents/');
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `teacher-${file.fieldname}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.get('/', getAllTeachers);
router.get('/count', getTeacherCount);
router.patch('/:teacherId/status', updateTeacherStatus);
router.patch('/:teacherId/course', updateCoursename);
router.get('/profile', authMiddleware, getTeacherProfile);
router.put(
  '/profile',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'idProofDocument', maxCount: 1 },
    { name: 'qualificationCertificates', maxCount: 20 },
    { name: 'experienceCertificates', maxCount: 20 },
  ]),
  authMiddleware,
  updateTeacherProfile
);
router.get('/courses', authMiddleware, getTeacherCourses);
router.get('/courses/:courseCode/students', authMiddleware, getTeacherCourseStudents);
router.get('/:teacherId/livesessions', authMiddleware, getTeacherLiveSessions);
router.get('/:teacherId/coursecount', authMiddleware, courseCountForTeacher);
router.get('/total-students', authMiddleware, getTotalStudentCountForTeacher);
router.delete('/delete-account/:teacherId', deleteTeacher);

router.use('/courses', courseRoutes);
router.use('/tests', testRoutes);
router.use('/notes', noteRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/livesessions', liveSessionRoutes);
router.use('/notifications', notificationRoutes);

export default router;
