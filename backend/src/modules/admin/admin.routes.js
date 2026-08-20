/**
 * Unified Admin & SuperAdmin Router
 * Combines all admin domain modules under /api/admin and /api/superadmin
 */

import express from 'express';
import studentRoutes from './students/student.routes.js';
import teacherRoutes from './teachers/teacher.routes.js';
import parentRoutes from './parents/parent.routes.js';
import classRoutes from './classes/classes.routes.js';
import subjectRoutes from './subjects/subject.routes.js';
import dashboardRoutes from './dashboard/dashboard.routes.js';
import payoutRoutes from './payouts/payout.routes.js';
import reportRoutes from './reports/adminReport.routes.js';
import subscriptionRoutes from './subscription/adminSubscription.routes.js';
import notificationRoutes from './notifications/adminNotification.routes.js';
import enrollmentRoutes from '../student/enrollments/studentEnrollment.routes.js';
import superAdminRoute from './superadmin.routes.js';

const router = express.Router();

// Domain Sub-modules
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/parents', parentRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payouts', payoutRoutes);
router.use('/reports', reportRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/notifications', notificationRoutes);

// Core Superadmin profile & utility routes
router.use('/', superAdminRoute);

export default router;
