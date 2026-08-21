import { Parent, ParentOtp, ParentToken } from '../../../models/index.js';
import { signAccessToken, signRefreshToken } from '../../../utils/jwt.js';
import pkg from 'sequelize';
const { Op } = pkg;

export const findParentByIdentifier = async (identifier) => {
  return await Parent.findOne({
    where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
  });
};

export const createParentAccount = async (data) => {
  return await Parent.create(data);
};

export const createParentOtpRecord = async (parentId, identifier, otpCode, otpType = 'SIGNUP') => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return await ParentOtp.create({
    parentId,
    identifier,
    otpCode,
    otpType,
    expiresAt,
    isUsed: false,
  });
};

export const createParentTokenSession = async (parentId, deviceType, playerId, ipAddress) => {
  const payload = { specificId: parentId, role: 'parent' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await ParentToken.create({
    parentId,
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

export const sanitizeParentData = (parent) => {
  if (!parent) return null;
  const data = typeof parent.toJSON === 'function' ? parent.toJSON() : { ...parent };
  delete data.passwordHash;
  delete data.otp;
  delete data.otpExpiresAt;
  delete data.otpVerified;
  return data;
};
