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
router.use(authMiddleware);

router.post('/', createSubscription);
router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.get('/buyed/all', getAllSubscriptionsBuyed);

export default router;
