import express from "express";
import { createPayment, getAllPayments, getPaymentById, getTotalEarningsByTeacher, getTeacherPayoutTransactions } from "../controllers/payoutController.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

// Create a new payment/payout request
router.post("/", createPayment);

// Get all payments with optional filtering
router.get("/", getAllPayments);

// Get total earnings for authenticated teacher (protected route)
router.get("/earning", authMiddleware, getTotalEarningsByTeacher);

// Get payout transactions for authenticated teacher (protected route)
router.get("/transactions", authMiddleware, getTeacherPayoutTransactions);

// Get payment by ID
router.get("/:id", getPaymentById);

export default router;
