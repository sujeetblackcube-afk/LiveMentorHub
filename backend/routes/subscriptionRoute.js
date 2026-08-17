/**
 * Legacy shared subscription routes.
 * Kept for rollback safety while the admin and teacher subscription flows are
 * being moved to their dedicated module folders.
 *
 * Public route contract is preserved by the app-level route mounts, and this file
 * is intentionally left as a compatibility layer.
 */

import express from 'express';
// import {
//   createSubscription,
//   getAllSubscriptions,
//   getSubscriptionById,
//   updateSubscription,
//   deleteSubscription,
//   createSubscriptionBuyed,
//   getSubscriptionBuyedById,
//   getSubscriptionsByTeacherId,
//   getAllSubscriptionsBuyed,
//   getSubscriptionsWithTeacherStatus,
//   verifySubscriptionCashfreeOrder,
// } from '../controllers/subscriptionController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// router.use(authMiddleware);
// router.post('/', createSubscription);
// router.post('/create-cashfree-order', authMiddleware, createSubscriptionBuyed);
// router.post('/verify-cashfree-order/:orderId', authMiddleware, verifySubscriptionCashfreeOrder);
// router.get('/', getAllSubscriptions);
// router.get('/:id', getSubscriptionById);
// router.put('/:id', updateSubscription);
// router.delete('/:id', deleteSubscription);
// router.get('/buyed/all', getAllSubscriptionsBuyed);
// router.post('/buyed/:teacherId', createSubscriptionBuyed);
// router.get('/buyed/:id', getSubscriptionBuyedById);
// router.get('/buyed/teacher/:teacherId', getSubscriptionsByTeacherId);
// router.get('/teacher/:teacherId/subscription-status', getSubscriptionsWithTeacherStatus);

export default router;
