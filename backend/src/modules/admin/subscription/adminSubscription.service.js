import Subscription from '../../../models/Subscription.js';
import SubscriptionBuyed from '../../../models/SubscriptionBuyed.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const createSubscriptionPlanService = async (payload = {}) => {
  const { planName, durationDays, CoursesAllowed, price, status } = payload;

  if (!planName || !durationDays || price === undefined) {
    const error = new Error('Plan name, duration days, and price are required');
    error.statusCode = 400;
    throw error;
  }

  const subscription = await Subscription.create({
    planName,
    durationDays,
    CoursesAllowed: CoursesAllowed || 0,
    price,
    status: status || 'active',
  });

  return subscription;
};

export const getAllSubscriptionsService = async (query = {}) => {
  const { status, page, limit } = query;
  const where = {};

  if (status) {
    where.status = status;
  }

  const queryOptions = {
    where,
    order: [['createdAt', 'DESC']],
  };

  if (page) {
    const paginatedResult = await getPaginatedData(Subscription, queryOptions, Number(page), Number(limit || 10));
    return {
      success: true,
      data: paginatedResult.data,
      pagination: {
        totalItems: paginatedResult.totalItems,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage,
        limit: paginatedResult.limit,
      },
    };
  }

  const subscriptions = await Subscription.findAll(queryOptions);
  return { success: true, data: subscriptions };
};

export const getSubscriptionByIdService = async (id) => {
  const subscription = await Subscription.findByPk(id);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.statusCode = 404;
    throw error;
  }
  return subscription;
};

export const updateSubscriptionByIdService = async (id, body = {}) => {
  const subscription = await Subscription.findByPk(id);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = ['planName', 'durationDays', 'CoursesAllowed', 'price', 'status'];
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      subscription[field] = body[field];
    }
  });

  await subscription.save();
  return subscription;
};

export const deleteSubscriptionByIdService = async (id) => {
  const subscription = await Subscription.findByPk(id);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.statusCode = 404;
    throw error;
  }

  await subscription.destroy();
  return { id };
};

export const getAllSubscriptionsBuyedService = async (query = {}) => {
  const { status, paymentStatus, page, limit } = query;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  const queryOptions = {
    where,
    order: [['createdAt', 'DESC']],
  };

  if (page) {
    const paginatedResult = await getPaginatedData(SubscriptionBuyed, queryOptions, Number(page), Number(limit || 10));
    return {
      success: true,
      data: paginatedResult.data,
      pagination: {
        totalItems: paginatedResult.totalItems,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage,
        limit: paginatedResult.limit,
      },
    };
  }

  const subscriptions = await SubscriptionBuyed.findAll(queryOptions);
  return { success: true, data: subscriptions };
};
