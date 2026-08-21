import express from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  studentLoginSchema,
  teacherLoginSchema,
  parentLoginSchema,
  adminLoginSchema,
  instituteLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from './auth.validator.js';

import {
  // Shared base handlers used inside role controllers
  studentSignup,
  teacherSignup,
  parentSignup,
  superAdminSignup,
  logout,
  verifyToken,

  // Dedicated Student Auth handlers
  studentLogin,
  studentForgotPassword,
  studentVerifyForgotPasswordOtp,
  studentResetPassword,
  studentVerifyOtp,
  studentResendOtp,
  studentRefreshToken,

  // Dedicated Teacher Auth handlers
  teacherLogin,
  teacherForgotPassword,
  teacherVerifyForgotPasswordOtp,
  teacherResetPassword,
  teacherVerifyOtp,
  teacherResendOtp,
  teacherRefreshToken,

  // Dedicated Parent Auth handlers
  parentLogin,
  parentForgotPassword,
  parentVerifyForgotPasswordOtp,
  parentResetPassword,
  parentVerifyOtp,
  parentResendOtp,
  parentRefreshToken,

  // Dedicated Admin Auth handlers
  adminLogin,
  adminForgotPassword,
  adminVerifyForgotPasswordOtp,
  adminResetPassword,
  adminRefreshToken,

  // Dedicated Institute Auth handlers
  instituteLogin,
  instituteForgotPassword,
  instituteVerifyForgotPasswordOtp,
  instituteResetPassword,
  instituteRefreshToken,
} from './auth.controller.js';

const router = express.Router();

// Apply auth rate limiting (15 attempts / 15 mins) to all auth endpoints
router.use(authRateLimiter);

// ====================================================
// 1. STUDENT DEDICATED AUTHENTICATION ENDPOINTS
// ====================================================
router.post('/student/login', validate(studentLoginSchema), studentLogin);
router.post('/student/register', studentSignup);
router.post('/student/forgot-password', validate(forgotPasswordSchema), studentForgotPassword);
router.post('/student/verify-forgot-password-otp', validate(verifyOtpSchema), studentVerifyForgotPasswordOtp);
router.post('/student/reset-password', validate(resetPasswordSchema), studentResetPassword);
router.post('/student/verify-otp', validate(verifyOtpSchema), studentVerifyOtp);
router.post('/student/resend-otp', validate(sendOtpSchema), studentResendOtp);
router.post('/student/refresh-token', studentRefreshToken);
router.post('/student/logout', authMiddleware, logout);
router.get('/student/verify-token', authMiddleware, verifyToken);

// ====================================================
// 2. TEACHER DEDICATED AUTHENTICATION ENDPOINTS
// ====================================================
router.post('/teacher/login', validate(teacherLoginSchema), teacherLogin);
router.post('/teacher/register', teacherSignup);
router.post('/teacher/forgot-password', validate(forgotPasswordSchema), teacherForgotPassword);
router.post('/teacher/verify-forgot-password-otp', validate(verifyOtpSchema), teacherVerifyForgotPasswordOtp);
router.post('/teacher/reset-password', validate(resetPasswordSchema), teacherResetPassword);
router.post('/teacher/verify-otp', validate(verifyOtpSchema), teacherVerifyOtp);
router.post('/teacher/resend-otp', validate(sendOtpSchema), teacherResendOtp);
router.post('/teacher/refresh-token', teacherRefreshToken);
router.post('/teacher/logout', authMiddleware, logout);
router.get('/teacher/verify-token', authMiddleware, verifyToken);

// ====================================================
// 3. PARENT DEDICATED AUTHENTICATION ENDPOINTS
// ====================================================
router.post('/parent/login', validate(parentLoginSchema), parentLogin);
router.post('/parent/register', parentSignup);
router.post('/parent/forgot-password', validate(forgotPasswordSchema), parentForgotPassword);
router.post('/parent/verify-forgot-password-otp', validate(verifyOtpSchema), parentVerifyForgotPasswordOtp);
router.post('/parent/reset-password', validate(resetPasswordSchema), parentResetPassword);
router.post('/parent/verify-otp', validate(verifyOtpSchema), parentVerifyOtp);
router.post('/parent/resend-otp', validate(sendOtpSchema), parentResendOtp);
router.post('/parent/refresh-token', parentRefreshToken);
router.post('/parent/logout', authMiddleware, logout);
router.get('/parent/verify-token', authMiddleware, verifyToken);

// ====================================================
// 4. ADMIN / SUPERADMIN DEDICATED AUTHENTICATION ENDPOINTS
// ====================================================
router.post('/admin/login', validate(adminLoginSchema), adminLogin);
router.post('/admin/register', superAdminSignup);
router.post('/admin/forgot-password', validate(forgotPasswordSchema), adminForgotPassword);
router.post('/admin/verify-forgot-password-otp', validate(verifyOtpSchema), adminVerifyForgotPasswordOtp);
router.post('/admin/reset-password', validate(resetPasswordSchema), adminResetPassword);
router.post('/admin/refresh-token', adminRefreshToken);
router.post('/admin/logout', authMiddleware, logout);
router.get('/admin/verify-token', authMiddleware, verifyToken);

// ====================================================
// 5. INSTITUTE DEDICATED AUTHENTICATION ENDPOINTS (FUTURE READY)
// ====================================================
router.post('/institute/login', validate(instituteLoginSchema), instituteLogin);
router.post('/institute/register', studentSignup);
router.post('/institute/forgot-password', validate(forgotPasswordSchema), instituteForgotPassword);
router.post('/institute/verify-forgot-password-otp', validate(verifyOtpSchema), instituteVerifyForgotPasswordOtp);
router.post('/institute/reset-password', validate(resetPasswordSchema), instituteResetPassword);
router.post('/institute/refresh-token', instituteRefreshToken);
router.post('/institute/logout', authMiddleware, logout);
router.get('/institute/verify-token', authMiddleware, verifyToken);

export default router;
