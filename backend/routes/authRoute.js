import express from 'express';
import { studentSignup, teacherSignup, parentSignup, superAdminSignup, login, resendOtp, verifyOtp, forgotPassword, verifyForgotPasswordOtp, resetPassword } from '../controllers/authcontroller.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.post('/register/student', studentSignup);
router.post('/register/teacher', teacherSignup);
router.post('/register/parent', parentSignup);
router.post('/register/superadmin', superAdminSignup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
router.post('/reset-password', resetPassword);

// // Token verification endpoint - verifies if the token is valid
// router.get('/verify-token', authMiddleware, verifyToken);


export default router;
