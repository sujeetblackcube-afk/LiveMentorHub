import rateLimit from 'express-rate-limit';

/**
 * Standard Global API Rate Limiter
 * Limits each IP to 100 requests per 5-minute window.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 5 minutes.',
  },
});

/**
 * Auth / Sensitive Endpoint Rate Limiter
 * Limits login, registration, and OTP attempts to 100 requests per 5-minute window per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 5 minutes.',
  },
});

/**
 * Payment / Checkout Endpoint Rate Limiter
 * Limits order generation & webhook calls to 100 requests per 5-minute window per IP.
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many checkout attempts. Please wait a moment before trying again.',
  },
});
