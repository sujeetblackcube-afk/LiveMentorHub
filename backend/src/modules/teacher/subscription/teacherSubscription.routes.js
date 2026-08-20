import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getAllSubscriptions,
  createSubscriptionBuyed,
  getSubscriptionsByTeacherId,
  getSubscriptionsWithTeacherStatus,
  verifySubscriptionCashfreeOrder,
} from './teacherSubscription.controller.js';

const router = express.Router();

const requireTeacherRole = (req, res, next) => {
  if (!req.auth || (req.auth.role !== 'teacher' && req.auth.role !== 'superadmin')) {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required',
    });
  }

  next();
};

router.use(authMiddleware);
router.use(requireTeacherRole);

// Clean short routes
router.get('/', getAllSubscriptions);
router.get('/status', getSubscriptionsWithTeacherStatus);
router.get('/status/:teacherId', getSubscriptionsWithTeacherStatus);
router.get('/my-subscriptions', getSubscriptionsByTeacherId);
router.get('/my-subscriptions/:teacherId', getSubscriptionsByTeacherId);

router.post('/create-cashfree-order', createSubscriptionBuyed);
router.post('/verify-cashfree-order/:orderId', verifySubscriptionCashfreeOrder);
router.post('/buyed/:teacherId', createSubscriptionBuyed);
router.get('/buyed/:id', async (req, res) => {
  const legacy = await import('../../../modules/admin/subscription/adminSubscription.controller.js');
  return legacy.getSubscriptionBuyedById(req, res);
});

// Legacy paths maintained for backward compatibility
router.get('/buyed/teacher/:teacherId', getSubscriptionsByTeacherId);
router.get('/teacher/:teacherId/subscription-status', getSubscriptionsWithTeacherStatus);

export default router;
