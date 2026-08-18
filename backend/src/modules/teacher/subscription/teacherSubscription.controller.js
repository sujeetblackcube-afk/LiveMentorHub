import {
  getTeacherActiveSubscriptionsService,
  createTeacherSubscriptionOrderService,
  getTeacherSubscriptionStatusService,
} from './teacherSubscription.service.js';

export const getSubscriptionsByTeacherId = async (req, res) => {
  try {
    const data = await getTeacherActiveSubscriptionsService(req.params.teacherId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const createSubscriptionBuyed = async (req, res) => {
  try {
    const data = await createTeacherSubscriptionOrderService({
      teacherId: req.body.teacherId || req.user?.teacherId,
      planName: req.body.planName,
      body: req.body,
      headers: req.headers,
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const getSubscriptionsWithTeacherStatus = async (req, res) => {
  try {
    const data = await getTeacherSubscriptionStatusService(req.params.teacherId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const verifySubscriptionCashfreeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const legacyController = await import('../../../modules/admin/subscription/adminSubscription.controller.js');
    return legacyController.verifySubscriptionCashfreeOrder(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};
