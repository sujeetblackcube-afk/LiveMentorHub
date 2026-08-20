/**
 * Internal teacher module aggregator.
 * Centralized master router for all teacher APIs under /api/teacher/...
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

// Shared module imports for complete teacher centralization
import questionRoutes from '../shared/questions/question.routes.js';
import doubtRoutes from '../student/doubts/studentDoubt.routes.js';
import payoutRoutes from '../admin/payouts/payout.routes.js';

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

import { getTeacherHomepage, getAllTeacherStudents } from '../../androidcontrollers/teacherstudentdatacontroller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const requireTeacherRole = (req, res, next) => {
  if (!req.auth || (req.auth.role !== 'teacher' && req.auth.role !== 'superadmin')) {
    return res.status(403).json({
      success: false,
      message: 'Teacher or Admin access required',
    });
  }

  next();
};

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

router.get('/', authMiddleware, requireTeacherRole, getAllTeachers);
router.get('/count', authMiddleware, requireTeacherRole, getTeacherCount);
router.patch('/:teacherId/status', authMiddleware, requireTeacherRole, updateTeacherStatus);
router.patch('/:teacherId/course', authMiddleware, requireTeacherRole, updateCoursename);
router.get('/profile', authMiddleware, requireTeacherRole, getTeacherProfile);

// Unified homescreenData single API endpoint (Total Students, Live Classes, Total Courses, Earnings, Banners, Courses)
router.get('/homescreenData', authMiddleware, getTeacherHomepage);
router.get('/homescreenData/:teacherId', authMiddleware, getTeacherHomepage);
router.get('/homescreen-data', authMiddleware, getTeacherHomepage);
router.get('/homescreen-data/:teacherId', authMiddleware, getTeacherHomepage);
router.get('/:teacherId/homescreenData', authMiddleware, getTeacherHomepage);

// Unified teacher students endpoint
router.get('/students', authMiddleware, getAllTeacherStudents);

router.put(
  '/profile',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'idProofDocument', maxCount: 1 },
    { name: 'qualificationCertificates', maxCount: 20 },
    { name: 'experienceCertificates', maxCount: 20 },
  ]),
  authMiddleware,
  requireTeacherRole,
  updateTeacherProfile
);
router.get('/courses', authMiddleware, requireTeacherRole, getTeacherCourses);
router.get('/courses/:courseCode/students', authMiddleware, requireTeacherRole, getTeacherCourseStudents);
router.get('/:teacherId/livesessions', authMiddleware, requireTeacherRole, getTeacherLiveSessions);
router.get('/:teacherId/coursecount', authMiddleware, requireTeacherRole, courseCountForTeacher);
router.get('/total-students', authMiddleware, requireTeacherRole, getTotalStudentCountForTeacher);
router.delete('/delete-account/:teacherId', authMiddleware, requireTeacherRole, deleteTeacher);

// Sub-domain routes mounted under /api/teacher/...
router.use('/courses', courseRoutes);
router.use('/tests', testRoutes);
router.use('/notes', noteRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/livesessions', liveSessionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/questions', questionRoutes);
router.use('/doubts', doubtRoutes);
router.use('/payouts', payoutRoutes);

export default router;
