import { InstituteOtp, InstituteToken } from '../../../models/index.js';
import { signAccessToken, signRefreshToken } from '../../../utils/jwt.js';

export const createInstituteOtpRecord = async (identifier, otpCode, otpType = 'LOGIN') => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return await InstituteOtp.create({
    identifier,
    otpCode,
    otpType,
    expiresAt,
    isUsed: false,
  });
};

export const createInstituteTokenSession = async (identifier, deviceType, playerId, ipAddress) => {
  const payload = { specificId: identifier, role: 'institute' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await InstituteToken.create({
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
