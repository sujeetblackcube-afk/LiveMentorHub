import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getTeacherNotifications,
  deleteAllTeacherNotifications,
  deleteNotificationById,
} from './teacherNotification.controller.js';

const router = express.Router();

const requireTeacherRole = (req, res, next) => {
  if (!req.auth || (req.auth.role !== 'teacher' && req.auth.role !== 'superadmin')) {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required',
    });
  }

  next();
};

router.use(authMiddleware);
router.use(requireTeacherRole);

// Handle root GET / (e.g. GET /api/teacher/notifications) and GET /notifications
router.get('/', getTeacherNotifications);
router.get('/notifications', getTeacherNotifications);

// Handle DELETE all
router.delete('/all', deleteAllTeacherNotifications);
router.delete('/notifications/all', deleteAllTeacherNotifications);

// Handle DELETE single notification
router.delete('/:notificationId', deleteNotificationById);
router.delete('/notifications/:notificationId', deleteNotificationById);

export default router;
