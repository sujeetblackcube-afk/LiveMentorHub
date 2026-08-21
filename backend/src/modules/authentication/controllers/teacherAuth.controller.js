import {
  findTeacherByIdentifier,
  createTeacherAccount,
  createTeacherOtpRecord,
  createTeacherTokenSession,
  sanitizeTeacherData,
} from '../services/teacherAuth.service.js';
import { hashPassword, comparePasswords, generateAndSendOTP, getClientIp, generateTeacherId } from '../auth.utils.js';
import { verifyOTP } from '../../../utils/otp.js';
import { verifyRefreshToken, signAccessToken } from '../../../utils/jwt.js';

export const teacherSignup = async (req, res) => {
  try {
    const { name, email, mobile, password, country, address, qualification } = req.body;
    const existing = await findTeacherByIdentifier(email);
    if (existing && existing.otpVerified) {
      return res.status(400).json({ success: false, message: 'Teacher account already registered with this email' });
    }

    const passwordHash = await hashPassword(password);
    const teacherId = await generateTeacherId();

    const teacher = await createTeacherAccount({ teacherId, name, email, mobile, passwordHash, country, address, qualification, otpVerified: false });
    const { otp, otpExpiresAt } = await generateAndSendOTP(email);
    await teacher.update({ otp, otpExpiresAt });
    await createTeacherOtpRecord(teacherId, email, otp, 'SIGNUP');

    return res.status(201).json({ success: true, message: 'Teacher account created. Verification OTP sent to email.', teacherId, expiresAt: otpExpiresAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherLogin = async (req, res) => {
  try {
    const { identifier, email, mobile, password, deviceType, playerId } = req.body;
    const loginInput = identifier || email || mobile;
    if (!loginInput || !password) return res.status(400).json({ success: false, message: 'Email/mobile and password required' });

    const teacher = await findTeacherByIdentifier(loginInput);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher account not found' });

    const isMatch = await comparePasswords(password, teacher.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

    const ipAddress = getClientIp(req);
    const { accessToken, refreshToken } = await createTeacherTokenSession(teacher.teacherId, deviceType, playerId, ipAddress);

    const userData = sanitizeTeacherData(teacher);

    return res.status(200).json({ success: true, message: 'Teacher login successful', token: accessToken, accessToken, refreshToken, role: 'teacher', user: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherForgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const teacher = await findTeacherByIdentifier(identifier);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const { otp, otpExpiresAt } = await generateAndSendOTP(teacher.email);
    await teacher.update({ otp, otpExpiresAt });
    await createTeacherOtpRecord(teacher.teacherId, teacher.email, otp, 'FORGOT_PASSWORD');

    return res.status(200).json({ success: true, message: 'Password reset OTP sent to your email', identifier: teacher.email, expiresAt: otpExpiresAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherVerifyForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const teacher = await findTeacherByIdentifier(identifier);
    if (!teacher || !verifyOTP(otp, teacher.otp, teacher.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    await teacher.update({ otpVerified: true });
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherResetPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const teacher = await findTeacherByIdentifier(identifier);
    if (!teacher || !teacher.otpVerified) return res.status(403).json({ success: false, message: 'OTP verification required' });

    const passwordHash = await hashPassword(newPassword);
    await teacher.update({ passwordHash, otp: null, otpExpiresAt: null, otpVerified: true });
    return res.status(200).json({ success: true, message: 'Teacher password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherVerifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const teacher = await findTeacherByIdentifier(identifier);
    if (!teacher || !verifyOTP(otp, teacher.otp, teacher.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    const ipAddress = getClientIp(req);
    const { accessToken, refreshToken } = await createTeacherTokenSession(teacher.teacherId, null, null, ipAddress);
    await teacher.update({ otpVerified: true });

    return res.status(200).json({ success: true, message: 'Teacher account verified successfully', token: accessToken, accessToken, refreshToken, role: 'teacher' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherResendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    const teacher = await findTeacherByIdentifier(identifier);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const { otp, otpExpiresAt } = await generateAndSendOTP(teacher.email);
    await teacher.update({ otp, otpExpiresAt });
    await createTeacherOtpRecord(teacher.teacherId, teacher.email, otp, 'LOGIN');
    return res.status(200).json({ success: true, message: 'OTP resent to email' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const teacherRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({ specificId: decoded.specificId, role: 'teacher' });
    return res.status(200).json({ success: true, message: 'Token refreshed', accessToken: newAccessToken, token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
