/**
 * Admin Payout Routes
 * Manages teacher payouts and earnings
 * Public endpoint: /api/payouts
 */

import express from "express";
import { createPayment, getAllPayments, getPaymentById, getTotalEarningsByTeacher, getTeacherPayoutTransactions } from "../../controllers/payoutController.js";
import authMiddleware from "../../middleware/authmiddleware.js";

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);
router.use(requireSuperAdmin);

// Create a new payment/payout request
router.post("/", createPayment);

// Get all payments with optional filtering
router.get("/", getAllPayments);

// Get total earnings for authenticated teacher (protected route)
router.get("/earning", getTotalEarningsByTeacher);

// Get payout transactions for authenticated teacher (protected route)
router.get("/transactions", getTeacherPayoutTransactions);

// Get payment by ID
router.get("/:id", getPaymentById);

export default router;
