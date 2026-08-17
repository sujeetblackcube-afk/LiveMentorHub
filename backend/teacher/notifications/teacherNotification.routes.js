import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  getTeacherNotifications,
  deleteAllTeacherNotifications,
} from './teacherNotification.controller.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/notifications', getTeacherNotifications);
router.delete('/notifications/all', deleteAllTeacherNotifications);

export default router;
