/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */

import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  loginSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../../utils/schemas.js';

import {
  studentSignup,
  teacherSignup,
  parentSignup,
  superAdminSignup,
  login,
  resendOtp,
  verifyOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  logout,
  verifyToken,
} from './auth.controller.js';

const router = express.Router();

// Apply auth rate limiting (15 attempts / 15 mins) to all auth endpoints
router.use(authRateLimiter);

/**
 * SIGNUP ENDPOINTS
 */
router.post('/register/student', validate(registerSchema), studentSignup);
router.post('/student/signup', validate(registerSchema), studentSignup);
router.post('/signup', validate(registerSchema), studentSignup);
router.post('/register/teacher', validate(registerSchema), teacherSignup);
router.post('/register/parent', validate(registerSchema), parentSignup);
router.post('/register/superadmin', validate(registerSchema), superAdminSignup);

/**
 * LOGIN & OTP VERIFICATION
 */
router.post('/login', validate(loginSchema), login);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', validate(sendOtpSchema), resendOtp);

/**
 * PASSWORD RESET
 */
router.post('/forgot-password', validate(sendOtpSchema), forgotPassword);
router.post('/verify-forgot-password-otp', validate(verifyOtpSchema), verifyForgotPasswordOtp);
router.post('/reset-password', resetPassword);

/**
 * LOGOUT & TOKEN VERIFICATION
 */
router.post('/logout', authMiddleware, logout);
router.get('/verify-token', authMiddleware, verifyToken);
router.get('/check-session', authMiddleware, verifyToken);

export default router;
