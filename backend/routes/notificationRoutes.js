/**
 * Legacy notification routes.
 * Kept for rollback safety while teacher/admin notification flows are moved under
 * backend/teacher/notifications and backend/admin/notifications.
 */

import express from 'express';
// import { savePlayerId, getStudentNotifications, deleteNotification, deleteAllNotifications, getNotificationByTeacherId, deleteAllNotificationByTeacher, getNotificationBySuperAdminId, deleteAllNotificationBySuperAdmin, deleteAllNotificationByParent, getNotificationByParentId } from '../controllers/notificationController.js';
// import { sendBroadcast } from '../controllers/broadcastController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// router.post('/save-player-id', savePlayerId);
// router.get('/student/:studentId', getStudentNotifications);
// router.delete('/:notificationId', deleteNotification);
// router.delete('/student/all/:studentId', deleteAllNotifications);
// router.get('/parent/:parentId', getNotificationByParentId);
// router.delete('/parent/all/:parentId', deleteAllNotificationByParent);
// router.get('/teacher/notifications', authMiddleware, getNotificationByTeacherId);
// router.delete('/teacher/notifications/all', authMiddleware, deleteAllNotificationByTeacher);
// router.get('/superadmin/notifications', authMiddleware, getNotificationBySuperAdminId);
// router.delete('/superadmin/notifications/all', authMiddleware, deleteAllNotificationBySuperAdmin);
// router.post('/broadcast', authMiddleware, sendBroadcast);

export default router;
