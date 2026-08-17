/**
 * ⚠️ DEPRECATED - DO NOT USE
 * 
 * This file has been refactored and moved to:
 * ../authentication/auth.routes.js
 * 
 * Please update your imports:
 * OLD: import authRoutes from './routes/authRoute.js';
 * NEW: import authRoutes from './authentication/auth.routes.js';
 * 
 * All authentication routes have been reorganized into the authentication/
 * module for better code organization and maintainability.
 * 
 * The new structure includes:
 * - authentication/auth.controller.js (HTTP handlers)
 * - authentication/auth.service.js (Business logic)
 * - authentication/auth.routes.js (Route definitions)
 * - authentication/auth.validation.js (Request validation)
 * 
 * See backend/docs/authentication.md for complete API documentation.
 */

// KEEPING THIS FILE FOR REFERENCE ONLY
// ===================================

/*
import express from 'express';
import { studentSignup, teacherSignup, parentSignup, superAdminSignup, login, resendOtp, verifyOtp, forgotPassword, verifyForgotPasswordOtp, resetPassword, logout, verifyToken } from '../controllers/authcontroller.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.post('/register/student', studentSignup);
router.post('/register/teacher', teacherSignup);
router.post('/register/parent', parentSignup);
router.post('/register/superadmin', superAdminSignup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPassword);

// Token / Single Device Session verification endpoints
router.get('/verify-token', authMiddleware, verifyToken);
router.get('/check-session', authMiddleware, verifyToken);

export default router;
*/
