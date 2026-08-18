import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getAdminNotifications,
  deleteAllAdminNotifications,
} from './adminNotification.controller.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get('/notifications', getAdminNotifications);
router.delete('/notifications/all', deleteAllAdminNotifications);

export default router;
