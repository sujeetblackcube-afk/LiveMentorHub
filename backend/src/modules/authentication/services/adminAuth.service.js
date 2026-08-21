import { SuperAdmin, AdminOtp, AdminToken } from '../../../models/index.js';
import { signAccessToken, signRefreshToken } from '../../../utils/jwt.js';
import pkg from 'sequelize';
const { Op } = pkg;

export const findAdminByIdentifier = async (identifier) => {
  return await SuperAdmin.findOne({
    where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
  });
};

export const createAdminAccount = async (data) => {
  return await SuperAdmin.create(data);
};

export const createAdminOtpRecord = async (userId, identifier, otpCode, otpType = 'LOGIN') => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return await AdminOtp.create({
    userId,
    identifier,
    otpCode,
    otpType,
    expiresAt,
    isUsed: false,
  });
};

export const createAdminTokenSession = async (userId, deviceType, playerId, ipAddress) => {
  const payload = { userId, role: 'superadmin' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await AdminToken.create({
    userId,
    accessToken,
    refreshToken,
    deviceType,
    playerId,
    ipAddress,
    isRevoked: false,
    expiresAt,
  });

  return { accessToken, refreshToken, expiresAt };
};

export const sanitizeAdminData = (admin) => {
  if (!admin) return null;
  const data = typeof admin.toJSON === 'function' ? admin.toJSON() : { ...admin };
  delete data.passwordHash;
  delete data.otp;
  delete data.otpExpiresAt;
  delete data.otpVerified;
  return data;
};
