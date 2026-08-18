/**
 * Admin Dashboard Routes
 * Superadmin access to system-wide statistics
 * Public endpoint: /api/dashboard
 */

import express from "express";
import { getDashboardStats } from '../../../modules/admin/dashboard/dashboard.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Forbidden" });
  }
};

router.get("/stats", authMiddleware, requireSuperAdmin, getDashboardStats);

export default router;
