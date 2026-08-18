import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  getAllSubscriptionsBuyed,
} from './adminSubscription.controller.js';
import {
  createSubscriptionBuyed,
  getSubscriptionsByTeacherId,
  getSubscriptionsWithTeacherStatus,
  verifySubscriptionCashfreeOrder,
} from '../../teacher/subscription/teacherSubscription.controller.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

const requireTeacherOrAdmin = (req, res, next) => {
  if (req.auth && (req.auth.role === "teacher" || req.auth.role === "superadmin")) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Teacher or Admin access required" });
};

router.use(authMiddleware);

// Get all subscriptions (Allowed for both Teachers and Admins)
router.get('/', getAllSubscriptions);

// Teacher Subscription purchase and management endpoints
router.post('/create-cashfree-order', requireTeacherOrAdmin, createSubscriptionBuyed);
router.post('/verify-cashfree-order/:orderId', requireTeacherOrAdmin, verifySubscriptionCashfreeOrder);
router.post('/buyed/:teacherId', requireTeacherOrAdmin, createSubscriptionBuyed);
router.get('/buyed/teacher/:teacherId', requireTeacherOrAdmin, getSubscriptionsByTeacherId);
router.get('/teacher/:teacherId/subscription-status', requireTeacherOrAdmin, getSubscriptionsWithTeacherStatus);

// Admin-only Subscription Management
router.get('/buyed/all', requireSuperAdmin, getAllSubscriptionsBuyed);
router.post('/', requireSuperAdmin, createSubscription);
router.get('/:id', getSubscriptionById);
router.put('/:id', requireSuperAdmin, updateSubscription);
router.delete('/:id', requireSuperAdmin, deleteSubscription);

export default router;
