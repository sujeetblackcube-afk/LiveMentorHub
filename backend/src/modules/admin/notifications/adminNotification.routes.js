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
router.get('/superadmin/:superAdminId', getNotificationBySuperAdminId);
router.delete('/superadmin/:superAdminId/all', deleteAllNotificationBySuperAdmin);
router.get('/', getNotificationBySuperAdminId);
router.delete('/all', deleteAllNotificationBySuperAdmin);

export default router;
