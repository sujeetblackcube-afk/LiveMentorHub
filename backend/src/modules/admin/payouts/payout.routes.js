/**
 * Admin & Teacher Payout Routes
 * Manages teacher payouts and earnings
 */

import express from "express";
import { createPayment, getAllPayments, getPaymentById, getTotalEarningsByTeacher, getTeacherPayoutTransactions } from './payout.controller.js';
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

// Flexible GET / handler (returns earnings for teacher, all payments for admin)
router.get("/", (req, res, next) => {
  if (req.auth && req.auth.role === "teacher") {
    return getTotalEarningsByTeacher(req, res);
  }
  return requireSuperAdmin(req, res, () => getAllPayments(req, res));
});

router.post("/", requireSuperAdmin, createPayment);
router.get("/:id", requireSuperAdmin, getPaymentById);

export default router;
