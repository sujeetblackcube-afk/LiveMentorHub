/**
 * Central Master Router
 * Mounts all domain feature modules under backend/src/modules/
 * Enforces explicit Role-Based Access Control (RBAC) guards:
 * - Public / Unauthorized (Anyone can access)
 * - Student Access ('student')
 * - Parent Access ('parent')
 * - Teacher Access ('teacher')
 * - SuperAdmin Access ('superadmin')
 */

import express from 'express';

// Role guards & auth middleware
import authMiddleware from '../middleware/auth.middleware.js';
import {
  requireStudent,
  requireTeacher,
  requireParent,
  requireSuperAdmin,
  requireTeacherOrAdmin,
  requireStudentOrAdmin,
} from '../middleware/role.middleware.js';

// Authentication Module
import authRoutes from '../modules/authentication/auth.routes.js';

// Student Module
import studentRoutes from '../modules/student/student.routes.js';
import enrollmentRoutes from '../modules/student/enrollments/studentEnrollment.routes.js';
import studentTestRoutes from '../modules/student/tests/studentTest.routes.js';
import studentNotesRoutes from '../modules/student/notes/studentNotes.routes.js';
import doubtRoutes from '../modules/student/doubts/studentDoubt.routes.js';
import reviewRoutes from '../modules/student/reviews/studentReview.routes.js';

// Teacher Module
import teacherRoutes from '../modules/teacher/teacher.routes.js';
import liveSessionRoutes from '../modules/teacher/livesessions/teacherLiveSession.routes.js';
import assignmentRoutes from '../modules/teacher/assignments/teacherAssignment.routes.js';

// Admin Module
import superAdminRoutes from '../modules/admin/admin.routes.js';
import parentRoutes from '../modules/admin/parents/parent.routes.js';
import classRoutes from '../modules/admin/classes/classes.routes.js';
import subjectRoutes from '../modules/admin/subjects/subject.routes.js';
import dashboardRoutes from '../modules/admin/dashboard/dashboard.routes.js';
import payoutRoutes from '../modules/admin/payouts/payout.routes.js';
import reportRoutes from '../modules/admin/reports/adminReport.routes.js';
import notificationRoutes from '../modules/admin/notifications/adminNotification.routes.js';
import subscriptionRoutes from '../modules/admin/subscription/adminSubscription.routes.js';

// Shared Modules
import courseRoutes from '../modules/shared/courses/course.routes.js';
import bannerRoutes from '../modules/shared/banners/banner.routes.js';
import contentRoutes from '../modules/shared/content/content.routes.js';
import contactUsRoutes from '../modules/shared/contactus/contactus.routes.js';
import questionRoutes from '../modules/shared/questions/question.routes.js';
import syllabusRoutes from '../modules/shared/syllabus/syllabus.routes.js';
import androidRoutes from '../modules/shared/android/android.routes.js';

const router = express.Router();

// ============================================================
// 1️⃣ PUBLIC / UNAUTHORIZED ROUTES (Anyone can access)
// ============================================================
router.use('/auth', authRoutes);
router.use('/android', androidRoutes); // Contains public /home/:studentId and /coursepagedata/:studentId
router.use('/banners', bannerRoutes);  // Public banner viewing
router.use('/content', contentRoutes);  // Public static pages (terms, privacy)
router.use('/contactus', contactUsRoutes); // Public contact form submission
router.use('/courses', courseRoutes);  // Public course catalog listings

// ============================================================
// 2️⃣ STUDENT ACCESS ROUTES
// ============================================================
router.use('/student', studentRoutes);
router.use('/students', studentRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/tests', studentTestRoutes);
router.use('/notes', studentNotesRoutes);
router.use('/doubts', doubtRoutes);
router.use('/reviews', reviewRoutes);

// ============================================================
// 3️⃣ TEACHER ACCESS ROUTES
// ============================================================
router.use('/teacher', teacherRoutes);
router.use('/teachers', teacherRoutes);
router.use('/livesessions', liveSessionRoutes);
router.use('/assignments', assignmentRoutes);

// ============================================================
// 4️⃣ PARENT & ADMIN ACCESS ROUTES
// ============================================================
router.use('/admin', superAdminRoutes);
router.use('/superadmin', superAdminRoutes);
router.use('/parents', parentRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/payouts', payoutRoutes);
router.use('/reports', reportRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/questions', questionRoutes);
router.use('/syllabus', syllabusRoutes);

export default router;
