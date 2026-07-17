import express from "express";
import {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  createSubscriptionBuyed,
  getSubscriptionBuyedById,
  getSubscriptionsByTeacherId,
  getAllSubscriptionsBuyed,
  getSubscriptionsWithTeacherStatus,
  createSubscriptionCashfreeOrder,
} from "../controllers/subscriptionController.js";

import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Create a new subscription
router.post("/", createSubscription);

// Cashfree order for subscriptions (teacher purchase)
router.post("/create-cashfree-order", authMiddleware, createSubscriptionCashfreeOrder);

// Get all subscriptions

router.get("/", getAllSubscriptions);

// Get a single subscription by ID
router.get("/:id", getSubscriptionById);

// Update a subscription
router.put("/:id", updateSubscription);

// Delete a subscription
router.delete("/:id", deleteSubscription);

// Get all subscriptions buyed (all records)
router.get("/buyed/all", getAllSubscriptionsBuyed);

// Create a new subscription buyed (teacherId from params, other fields from body)
router.post("/buyed/:teacherId", createSubscriptionBuyed);

// Get subscription buyed by ID
router.get("/buyed/:id", getSubscriptionBuyedById);

// Get all subscriptions buyed by teacher ID
router.get("/buyed/teacher/:teacherId", getSubscriptionsByTeacherId);

router.get(
  "/teacher/:teacherId/subscription-status",
  getSubscriptionsWithTeacherStatus
);

export default router;
