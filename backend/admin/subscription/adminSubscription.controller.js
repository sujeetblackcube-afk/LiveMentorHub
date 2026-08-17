import {
  createSubscriptionPlanService,
  getAllSubscriptionsService,
  getSubscriptionByIdService,
  updateSubscriptionByIdService,
  deleteSubscriptionByIdService,
  getAllSubscriptionsBuyedService,
} from './adminSubscription.service.js';

export const createSubscription = async (req, res) => {
  try {
    const data = await createSubscriptionPlanService(req.body);
    return res.status(201).json({ success: true, message: 'Subscription created successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const data = await getAllSubscriptionsService(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const data = await getSubscriptionByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Subscription not found' });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const data = await updateSubscriptionByIdService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Subscription updated successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const data = await deleteSubscriptionByIdService(req.params.id);
    return res.status(200).json({ success: true, message: 'Subscription deleted successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getAllSubscriptionsBuyed = async (req, res) => {
  try {
    const data = await getAllSubscriptionsBuyedService(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};
