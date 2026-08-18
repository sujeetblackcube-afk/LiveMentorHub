import rateLimit from 'express-rate-limit';

/**
 * Standard Global API Rate Limiter
 * Limits each IP to 50 requests per 10-minute window.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 10 minutes.',
  },
});

/**
 * Auth / Sensitive Endpoint Rate Limiter
 * Limits login, registration, and OTP attempts to 15 requests per 15-minute window per IP.
 * Protects against brute-force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * Payment / Checkout Endpoint Rate Limiter
 * Limits order generation & webhook calls to 20 requests per 15-minute window per IP.
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many checkout attempts. Please wait a moment before trying again.',
  },
});
