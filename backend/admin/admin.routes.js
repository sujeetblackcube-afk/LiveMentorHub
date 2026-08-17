/**
 * Admin Routes
 * Combines admin module routes for students and teachers
 * Routes for classes and courses are mounted in superAdminRoute.js at /api/superadmin
 */

import express from 'express';
import studentRoutes from './students/student.routes.js';
import teacherRoutes from './teachers/teacher.routes.js';
import subscriptionRoutes from './subscription/adminSubscription.routes.js';
import reportRoutes from './reports/adminReport.routes.js';
import notificationRoutes from './notifications/adminNotification.routes.js';

const router = express.Router();

/**
 * Admin Student Management Routes
 * Mounted at: /api/admin/students
 */
router.use('/students', studentRoutes);

/**
 * Admin Teacher Management Routes
 * Mounted at: /api/admin/teachers
 */
router.use('/teachers', teacherRoutes);

/**
 * Admin Subscription Management Routes
 * Mounted at: /api/admin/subscriptions
 */
router.use('/subscriptions', subscriptionRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

export default router;
