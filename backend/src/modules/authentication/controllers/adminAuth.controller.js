import {
  findAdminByIdentifier,
  createAdminAccount,
  createAdminOtpRecord,
  createAdminTokenSession,
  sanitizeAdminData,
} from '../services/adminAuth.service.js';
import { hashPassword, comparePasswords, generateAndSendOTP, getClientIp } from '../auth.utils.js';
import { verifyOTP } from '../../../utils/otp.js';
import { verifyRefreshToken, signAccessToken } from '../../../utils/jwt.js';

export const superAdminSignup = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;
    const existing = await findAdminByIdentifier(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin account already registered' });
    }

    const passwordHash = await hashPassword(password);
    const admin = await createAdminAccount({ name, email, mobile, passwordHash, role: role || 'superadmin' });
    return res.status(201).json({ success: true, message: 'Admin account created successfully', adminId: admin.userId });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { identifier, email, mobile, password, deviceType, playerId } = req.body;
    const loginInput = identifier || email || mobile;
    if (!loginInput || !password) return res.status(400).json({ success: false, message: 'Email/mobile and password required' });

    const admin = await findAdminByIdentifier(loginInput);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin account not found' });

    const isMatch = await comparePasswords(password, admin.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

    const ipAddress = getClientIp(req);
    const { accessToken, refreshToken } = await createAdminTokenSession(admin.userId, deviceType, playerId, ipAddress);

    const userData = sanitizeAdminData(admin);

    return res.status(200).json({ success: true, message: 'Admin login successful', token: accessToken, accessToken, refreshToken, role: 'superadmin', user: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adminForgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const admin = await findAdminByIdentifier(identifier);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const { otp, otpExpiresAt } = await generateAndSendOTP(admin.email);
    await admin.update({ otp, otpExpiresAt });
    await createAdminOtpRecord(admin.userId, admin.email, otp, 'FORGOT_PASSWORD');

    return res.status(200).json({ success: true, message: 'Password reset OTP sent to email', identifier: admin.email, expiresAt: otpExpiresAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adminVerifyForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const admin = await findAdminByIdentifier(identifier);
    if (!admin || !verifyOTP(otp, admin.otp, admin.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    await admin.update({ otpVerified: true });
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adminResetPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const admin = await findAdminByIdentifier(identifier);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin account not found' });

    const passwordHash = await hashPassword(newPassword);
    await admin.update({ passwordHash, otp: null, otpExpiresAt: null, otpVerified: true });
    return res.status(200).json({ success: true, message: 'Admin password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adminRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({ userId: decoded.userId, role: 'superadmin' });
    return res.status(200).json({ success: true, message: 'Token refreshed', accessToken: newAccessToken, token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
