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
import superAdminRoute from '../routes/superAdminRoute.js';

const router = express.Router();

/**
 * Admin Student Management Routes
 * Mounted at: /api/superadmin/students
 */
router.use('/students', studentRoutes);

/**
 * Admin Teacher Management Routes
 * Mounted at: /api/superadmin/teachers
 */
router.use('/teachers', teacherRoutes);

/**
 * Admin Subscription Management Routes
 * Mounted at: /api/superadmin/subscriptions
 */
router.use('/subscriptions', subscriptionRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

/**
 * Core Superadmin Routes (Profile, Classes, Courses, Reviews)
 * Mounted at: /api/superadmin
 */
router.use('/', superAdminRoute);

export default router;
