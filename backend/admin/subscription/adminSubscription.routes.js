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

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);
router.use(requireSuperAdmin);

router.post('/', createSubscription);
router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.get('/buyed/all', getAllSubscriptionsBuyed);

export default router;
