import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import { getAdminTeacherReport } from './adminReport.controller.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);
router.use(requireSuperAdmin);
router.get('/:teacherId', getAdminTeacherReport);

export default router;
