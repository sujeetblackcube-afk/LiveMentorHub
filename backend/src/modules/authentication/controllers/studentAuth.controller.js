import { Student } from '../../../models/index.js';
import {
  findStudentByIdentifier,
  createStudentAccount,
  createStudentOtpRecord,
  createStudentTokenSession,
  getStudentEnrollmentStatus,
  sanitizeStudentData,
} from '../services/studentAuth.service.js';
import { hashPassword, comparePasswords, generateAndSendOTP, getClientIp, generateStudentId } from '../auth.utils.js';
import { verifyOTP } from '../../../utils/otp.js';
import { verifyRefreshToken, signAccessToken } from '../../../utils/jwt.js';

/**
 * Student Registration
 * POST /api/auth/student/register
 */
export const studentSignup = async (req, res) => {
  try {
    const { name, email, mobile, parentName, parentEmail, parentMobile, password, country, address, deviceType, playerId } = req.body;

    const existing = await findStudentByIdentifier(email);
    if (existing && existing.otpVerified) {
      return res.status(400).json({ success: false, message: 'Student account already registered with this email' });
    }

    const passwordHash = await hashPassword(password);
    const studentId = await generateStudentId();

    const student = await createStudentAccount({
      studentId,
      name,
      email,
      mobile,
      parentName,
      parentEmail,
      parentMobile,
      passwordHash,
      country,
      address,
      otpVerified: false,
    });

    const { otp, otpExpiresAt } = await generateAndSendOTP(email);
    await student.update({ otp, otpExpiresAt });
    await createStudentOtpRecord(studentId, email, otp, 'SIGNUP');

    return res.status(201).json({
      success: true,
      message: 'Student account created. Verification OTP sent to email.',
      studentId,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error('Student registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Student Login
 * POST /api/auth/student/login
 */
export const studentLogin = async (req, res) => {
  try {
    const { identifier, email, mobile, password, deviceType, playerId } = req.body;
    const loginInput = identifier || email || mobile;

    if (!loginInput || !password) {
      return res.status(400).json({ success: false, message: 'Email/mobile and password are required' });
    }

    const student = await findStudentByIdentifier(loginInput);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    const isMatch = await comparePasswords(password, student.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const ipAddress = getClientIp(req);
    const { accessToken, refreshToken } = await createStudentTokenSession(
      student.studentId,
      deviceType,
      playerId,
      ipAddress
    );

    await student.update({ activeToken: accessToken, isLoggedIn: true });
    const enrollmentStatus = await getStudentEnrollmentStatus(student.studentId);
    const userData = sanitizeStudentData(student);

    return res.status(200).json({
      success: true,
      message: 'Student login successful',
      token: accessToken,
      accessToken,
      refreshToken,
      role: 'student',
      enrollmentStatus,
      user: userData,
    });
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Student Forgot Password
 * POST /api/auth/student/forgot-password
 */
export const studentForgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const student = await findStudentByIdentifier(identifier);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with provided identifier' });
    }

    const { otp, otpExpiresAt } = await generateAndSendOTP(student.email);
    await student.update({ otp, otpExpiresAt });
    await createStudentOtpRecord(student.studentId, student.email, otp, 'FORGOT_PASSWORD');

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      identifier: student.email,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error('Student forgot password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Student Verify Forgot Password OTP
 * POST /api/auth/student/verify-forgot-password-otp
 */
export const studentVerifyForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const student = await findStudentByIdentifier(identifier);

    if (!student || !verifyOTP(otp, student.otp, student.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await student.update({ otpVerified: true });
    return res.status(200).json({ success: true, message: 'OTP verified successfully. You may reset your password now.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Student Reset Password
 * POST /api/auth/student/reset-password
 */
export const studentResetPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const student = await findStudentByIdentifier(identifier);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    if (!student.otpVerified) {
      return res.status(403).json({ success: false, message: 'OTP verification required before password reset' });
    }

    const passwordHash = await hashPassword(newPassword);
    await student.update({ passwordHash, otp: null, otpExpiresAt: null, otpVerified: true });

    return res.status(200).json({ success: true, message: 'Student password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Student Verify Account OTP
 * POST /api/auth/student/verify-otp
 */
export const studentVerifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const student = await findStudentByIdentifier(identifier);

    if (!student || !verifyOTP(otp, student.otp, student.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const ipAddress = getClientIp(req);
    const { accessToken, refreshToken } = await createStudentTokenSession(student.studentId, null, null, ipAddress);
    await student.update({ otpVerified: true, activeToken: accessToken, isLoggedIn: true });

    return res.status(200).json({
      success: true,
      message: 'Student account verified successfully',
      token: accessToken,
      accessToken,
      refreshToken,
      role: 'student',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Student Resend OTP
 * POST /api/auth/student/resend-otp
 */
export const studentResendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    const student = await findStudentByIdentifier(identifier);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { otp, otpExpiresAt } = await generateAndSendOTP(student.email);
    await student.update({ otp, otpExpiresAt });
    await createStudentOtpRecord(student.studentId, student.email, otp, 'LOGIN');

    return res.status(200).json({ success: true, message: 'OTP resent successfully to email' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Student Refresh Token
 * POST /api/auth/student/refresh-token
 */
export const studentRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({ specificId: decoded.specificId, role: 'student' });

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken: newAccessToken,
      token: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};
