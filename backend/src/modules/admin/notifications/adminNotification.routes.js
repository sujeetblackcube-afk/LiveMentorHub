import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getStudentNotifications,
  deleteAllNotifications,
  deleteNotification,
  getNotificationByTeacherId,
  deleteAllNotificationByTeacher,
  getNotificationBySuperAdminId,
  deleteAllNotificationBySuperAdmin,
  getNotificationByParentId,
  deleteAllNotificationByParent,
} from './adminNotification.controller.js';

const router = express.Router();

router.use(authMiddleware);

// Student Notification Endpoints
router.get('/student/:studentId', getStudentNotifications);
router.delete('/student/:studentId/all', deleteAllNotifications);
router.delete('/student/:notificationId', deleteNotification);

// Teacher Notification Endpoints
router.get('/teacher/notifications', getNotificationByTeacherId);
router.get('/teacher/:teacherId', getNotificationByTeacherId);
router.delete('/teacher/notifications/all', deleteAllNotificationByTeacher);
router.delete('/teacher/:teacherId/all', deleteAllNotificationByTeacher);

// Parent Notification Endpoints
router.get('/parent/:parentId', getNotificationByParentId);
router.delete('/parent/:parentId/all', deleteAllNotificationByParent);

// Admin Notification Endpoints
router.get('/notifications', getNotificationBySuperAdminId);
router.get('/superadmin/notifications', getNotificationBySuperAdminId);
router.get('/superadmin/:superAdminId', getNotificationBySuperAdminId);
router.delete('/notifications/all', deleteAllNotificationBySuperAdmin);
router.delete('/superadmin/notifications/all', deleteAllNotificationBySuperAdmin);
router.delete('/superadmin/:superAdminId/all', deleteAllNotificationBySuperAdmin);
router.get('/', getNotificationBySuperAdminId);
router.delete('/all', deleteAllNotificationBySuperAdmin);

import { sendBroadcast } from './broadcast.controller.js';

// Broadcast Notification Endpoints
router.post('/broadcast', sendBroadcast);
router.post('/send-broadcast', sendBroadcast);

export default router;
