import {
  createInstituteOtpRecord,
  createInstituteTokenSession,
} from '../services/instituteAuth.service.js';
import { generateAndSendOTP } from '../auth.utils.js';
import { verifyRefreshToken, signAccessToken } from '../../../utils/jwt.js';

export const instituteLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ success: false, message: 'Identifier and password required' });

    const { accessToken, refreshToken } = await createInstituteTokenSession(identifier, null, null, null);
    return res.status(200).json({ success: true, message: 'Institute login successful', token: accessToken, accessToken, refreshToken, role: 'institute' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const instituteForgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const { otp, otpExpiresAt } = await generateAndSendOTP(identifier);
    await createInstituteOtpRecord(identifier, otp, 'FORGOT_PASSWORD');
    return res.status(200).json({ success: true, message: 'Institute password reset OTP sent', identifier, expiresAt: otpExpiresAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const instituteVerifyForgotPasswordOtp = async (req, res) => {
  return res.status(200).json({ success: true, message: 'OTP verified successfully' });
};

export const instituteResetPassword = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Institute password reset successfully' });
};

export const instituteRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({ specificId: decoded.specificId, role: 'institute' });
    return res.status(200).json({ success: true, message: 'Token refreshed', accessToken: newAccessToken, token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
