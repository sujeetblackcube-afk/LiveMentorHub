import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  getAdminNotifications,
  deleteAllAdminNotifications,
} from './adminNotification.controller.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/notifications', getAdminNotifications);
router.delete('/notifications/all', deleteAllAdminNotifications);

export default router;
