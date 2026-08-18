import Subscription from '../../../models/Subscription.js';
import SubscriptionBuyed from '../../../models/SubscriptionBuyed.js';
import { Teacher } from '../../../models/index.js';
import { createCashfreeClient } from '../../../utils/cashfree.js';

export const getTeacherActiveSubscriptionsService = async (teacherId) => {
  const subscriptions = await SubscriptionBuyed.findAll({
    where: { teacherId },
    order: [['createdAt', 'DESC']],
  });

  return subscriptions;
};

export const createTeacherSubscriptionOrderService = async ({ teacherId, planName, body = {}, headers = {} }) => {
  if (!teacherId || !planName) {
    const error = new Error('teacherId and planName are required');
    error.statusCode = 400;
    throw error;
  }

  const subscriptionPlan = await Subscription.findOne({
    where: { planName, status: { in: ['APPROVED', 'PASSOUT'] } },
  });

  if (!subscriptionPlan) {
    const error = new Error('Subscription plan not found');
    error.statusCode = 404;
    throw error;
  }

  const teacher = await Teacher.findOne({ where: { teacherId } });
  if (!teacher) {
    const error = new Error('Teacher not found');
    error.statusCode = 404;
    throw error;
  }

  const finalDurationDays = body.durationDays ? parseInt(body.durationDays, 10) : (subscriptionPlan.durationDays || 30);
  const now = new Date();
  const startDate = body.startDate ? new Date(body.startDate).toISOString() : now.toISOString();
  let endDate;
  if (body.endDate) {
    endDate = new Date(body.endDate).toISOString();
  } else {
    const calcEnd = new Date(now);
    calcEnd.setDate(calcEnd.getDate() + finalDurationDays);
    endDate = calcEnd.toISOString();
  }

  const price = subscriptionPlan.price;
  const currency = process.env.CASHFREE_CURRENCY || 'INR';
  const cfOrderId = `SUB_${Date.now()}_${teacherId}`;

  let returnBaseUrl = process.env.CASHFREE_RETURN_URL || process.env.FRONTEND_URL;
  if (!returnBaseUrl) {
    const origin = headers.origin || 'http://localhost:5173';
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    returnBaseUrl = cleanOrigin.endsWith('/teacher') ? cleanOrigin : `${cleanOrigin}/teacher`;
  }

  if (process.env.CASHFREE_ENV === 'PRODUCTION' && returnBaseUrl.startsWith('http://')) {
    returnBaseUrl = returnBaseUrl.replace(/^http:\/\//i, 'https://');
  }

  const normalizedReturnUrl = returnBaseUrl.endsWith('/') ? returnBaseUrl : `${returnBaseUrl}/`;

  const request = {
    order_amount: Math.round(price),
    order_currency: currency.toUpperCase(),
    order_id: cfOrderId,
    customer_details: {
      customer_id: String(teacherId),
      customer_phone: teacher.mobile || '9999999999',
      customer_email: teacher.email || 'teacher@example.com',
      customer_name: teacher.name || 'Teacher',
    },
    order_meta: {
      return_url: `${normalizedReturnUrl}checkout-success?order_id={order_id}`,
    },
    order_tags: {
      teacherId: String(teacherId),
      planName: String(planName),
      durationDays: String(finalDurationDays),
      startDate: String(startDate),
      endDate: String(endDate),
      orderId: body.orderId ? String(body.orderId) : String(cfOrderId),
      type: 'subscription',
    },
  };

  const client = createCashfreeClient();
  const response = await client.PGCreateOrder(request);

  const newSubscription = await SubscriptionBuyed.create({
    teacherId: response.data.customer_details.customer_id,
    teacherName: response.data.customer_details.customer_name,
    orderId: response.data.order_id,
    planName: response.data.order_tags.planName,
    price: parseFloat(response.data.order_amount),
    durationDays: parseInt(response.data.order_tags.durationDays),
    startDate: response.data.order_tags.startDate,
    endDate: response.data.order_tags.endDate,
    status: 'active',
    paymentStatus: 'pending',
  });

  return {
    success: true,
    payment_session_id: response.data.payment_session_id,
    order_id: cfOrderId,
    cf_mode: process.env.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox',
    subscription: newSubscription,
  };
};

export const getTeacherSubscriptionStatusService = async (teacherId) => {
  const allSubscriptions = await Subscription.findAll({ order: [['createdAt', 'DESC']] });
  const buyedSubscriptions = await SubscriptionBuyed.findAll({ where: { teacherId }, order: [['createdAt', 'DESC']] });
  const buyedPlanNames = [...new Set(buyedSubscriptions.map((item) => item.planName))];
  const notBuyedSubscriptions = allSubscriptions.filter((subscription) => !buyedPlanNames.includes(subscription.planName));

  return { buyedSubscriptions, notBuyedSubscriptions };
};
