/**
 * Parent Management Routes
 * Managed by admin users for parent operations
 * Public endpoint: /api/parents
 */

import express from "express";
import {
  getAllParents,
  updateParentStatus,
  getParentCount,
  getStudentsByParentId,
  updateParentData,
  getParentById,
  deleteParent
} from '../../../modules/admin/parents/parent.controller.js';
import { uploadProfile } from '../../../modules/admin/parents/parent.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && ['superadmin', 'admin', 'subadmin'].includes(req.auth.role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get("/", getAllParents);
router.get("/count", getParentCount);
router.patch("/:parentId/status", updateParentStatus);
router.get("/students/:parentId", getStudentsByParentId);
router.put("/:parentId", uploadProfile.single('profileImage'), updateParentData);
router.get("/:parentId", getParentById);

// terminate parent account
router.delete("/delete-account/:parentId", deleteParent);

export default router;
