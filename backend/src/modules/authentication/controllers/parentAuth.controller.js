import {
  findParentByIdentifier,
  createParentAccount,
  createParentOtpRecord,
  createParentTokenSession,
  sanitizeParentData,
} from '../services/parentAuth.service.js';
import { hashPassword, comparePasswords, generateAndSendOTP, getClientIp, generateParentId } from '../auth.utils.js';
import { verifyOTP } from '../../../utils/otp.js';
import { verifyRefreshToken, signAccessToken } from '../../../utils/jwt.js';

export const parentSignup = async (req, res) => {
  try {
    const { name, email, mobile, password, country, address } = req.body;
    const existing = await findParentByIdentifier(email);
    if (existing && existing.otpVerified) {
      return res.status(400).json({ success: false, message: 'Parent account already registered' });
    }

    const passwordHash = await hashPassword(password);
    const parentId = await generateParentId();

    const parent = await createParentAccount({ parentId, name, email, mobile, passwordHash, country, address, otpVerified: false });
    const { otp, otpExpiresAt } = await generateAndSendOTP(email);
    await parent.update({ otp, otpExpiresAt });
    await createParentOtpRecord(parentId, email, otp, 'SIGNUP');

    return res.status(201).json({ success: true, message: 'Parent account created. Verification OTP sent.', parentId, expiresAt: otpExpiresAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const parentLogin = async (req, res) => {
  try {
    const { identifier, email, mobile, password, deviceType, playerId } = req.body;
    const loginInput = identifier || email || mobile;
    if (!loginInput || !password) return res.status(400).json({ success: false, message: 'Email/mobile and password required' });

    const parent = await findParentByIdentifier(loginInput);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent account not found' });

    const isMatch = await comparePasswords(password, parent.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

    const ipAddress = getClientIp(req);
    const { accessToken, refreshToken } = await createParentTokenSession(parent.parentId, deviceType, playerId, ipAddress);

    const userData = sanitizeParentData(parent);

    return res.status(200).json({ success: true, message: 'Parent login successful', token: accessToken, accessToken, refreshToken, role: 'parent', user: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const parentForgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const parent = await findParentByIdentifier(identifier);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });

    const { otp, otpExpiresAt } = await generateAndSendOTP(parent.email);
    await parent.update({ otp, otpExpiresAt });
    await createParentOtpRecord(parent.parentId, parent.email, otp, 'FORGOT_PASSWORD');

    return res.status(200).json({ success: true, message: 'Password reset OTP sent to email', identifier: parent.email, expiresAt: otpExpiresAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const parentVerifyForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const parent = await findParentByIdentifier(identifier);
    if (!parent || !verifyOTP(otp, parent.otp, parent.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    await parent.update({ otpVerified: true });
    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const parentResetPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const parent = await findParentByIdentifier(identifier);
    if (!parent || !parent.otpVerified) return res.status(403).json({ success: false, message: 'OTP verification required' });

    const passwordHash = await hashPassword(newPassword);
    await parent.update({ passwordHash, otp: null, otpExpiresAt: null, otpVerified: true });
    return res.status(200).json({ success: true, message: 'Parent password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const parentVerifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const parent = await findParentByIdentifier(identifier);
    if (!parent || !verifyOTP(otp, parent.otp, parent.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    const ipAddress = getClientIp(req);
    const { accessToken, refreshToken } = await createParentTokenSession(parent.parentId, null, null, ipAddress);
    await parent.update({ otpVerified: true });

    return res.status(200).json({ success: true, message: 'Parent account verified successfully', token: accessToken, accessToken, refreshToken, role: 'parent' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const parentResendOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    const parent = await findParentByIdentifier(identifier);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });

    const { otp, otpExpiresAt } = await generateAndSendOTP(parent.email);
    await parent.update({ otp, otpExpiresAt });
    await createParentOtpRecord(parent.parentId, parent.email, otp, 'LOGIN');
    return res.status(200).json({ success: true, message: 'OTP resent to email' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const parentRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({ specificId: decoded.specificId, role: 'parent' });
    return res.status(200).json({ success: true, message: 'Token refreshed', accessToken: newAccessToken, token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
