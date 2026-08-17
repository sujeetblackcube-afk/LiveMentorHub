/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */

import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';
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

/**
 * SIGNUP ENDPOINTS
 */
router.post('/register/student', studentSignup);
router.post('/register/teacher', teacherSignup);
router.post('/register/parent', parentSignup);
router.post('/register/superadmin', superAdminSignup);

/**
 * LOGIN & OTP VERIFICATION
 */
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

/**
 * PASSWORD RESET
 */
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPassword);

/**
 * LOGOUT & TOKEN VERIFICATION
 */
router.post('/logout', authMiddleware, logout);
router.get('/verify-token', authMiddleware, verifyToken);
router.get('/check-session', authMiddleware, verifyToken);

export default router;
