/**
 * Admin Payout Routes
 * Manages teacher payouts and earnings
 * Public endpoint: /api/payouts
 */

import express from "express";
import { createPayment, getAllPayments, getPaymentById, getTotalEarningsByTeacher, getTeacherPayoutTransactions } from '../../../modules/admin/payouts/payout.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);

// Teacher-accessible payout routes (authenticated teacher)
router.get("/earning", getTotalEarningsByTeacher);
router.get("/transactions", getTeacherPayoutTransactions);

// Admin-only payout management routes
router.post("/", requireSuperAdmin, createPayment);
router.get("/", requireSuperAdmin, getAllPayments);
router.get("/:id", requireSuperAdmin, getPaymentById);

export default router;
