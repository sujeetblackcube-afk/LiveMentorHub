import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  createSubscriptionBuyed,
  getSubscriptionsByTeacherId,
  getSubscriptionsWithTeacherStatus,
  verifySubscriptionCashfreeOrder,
} from './teacherSubscription.controller.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/create-cashfree-order', createSubscriptionBuyed);
router.post('/verify-cashfree-order/:orderId', verifySubscriptionCashfreeOrder);
router.post('/buyed/:teacherId', createSubscriptionBuyed);
router.get('/buyed/:id', async (req, res) => {
  const legacy = await import('../../controllers/subscriptionController.js');
  return legacy.getSubscriptionBuyedById(req, res);
});
router.get('/buyed/teacher/:teacherId', getSubscriptionsByTeacherId);
router.get('/teacher/:teacherId/subscription-status', getSubscriptionsWithTeacherStatus);

export default router;
