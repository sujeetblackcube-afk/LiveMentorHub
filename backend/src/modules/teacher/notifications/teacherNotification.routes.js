import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getTeacherNotifications,
  deleteAllTeacherNotifications,
} from './teacherNotification.controller.js';

const router = express.Router();

const requireTeacherRole = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required',
    });
  }

  next();
};

router.use(authMiddleware);
router.use(requireTeacherRole);

router.get('/notifications', getTeacherNotifications);
router.delete('/notifications/all', deleteAllTeacherNotifications);

export default router;
