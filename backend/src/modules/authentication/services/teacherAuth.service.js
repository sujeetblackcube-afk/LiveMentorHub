import { Teacher, TeacherOtp, TeacherToken } from '../../../models/index.js';
import { signAccessToken, signRefreshToken } from '../../../utils/jwt.js';
import pkg from 'sequelize';
const { Op } = pkg;

export const findTeacherByIdentifier = async (identifier) => {
  return await Teacher.findOne({
    where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
  });
};

export const createTeacherAccount = async (data) => {
  return await Teacher.create(data);
};

export const createTeacherOtpRecord = async (teacherId, identifier, otpCode, otpType = 'SIGNUP') => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return await TeacherOtp.create({
    teacherId,
    identifier,
    otpCode,
    otpType,
    expiresAt,
    isUsed: false,
  });
};

export const createTeacherTokenSession = async (teacherId, deviceType, playerId, ipAddress) => {
  const payload = { specificId: teacherId, role: 'teacher' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await TeacherToken.create({
    teacherId,
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

export const sanitizeTeacherData = (teacher) => {
  if (!teacher) return null;
  const data = typeof teacher.toJSON === 'function' ? teacher.toJSON() : { ...teacher };
  delete data.passwordHash;
  delete data.otp;
  delete data.otpExpiresAt;
  delete data.otpVerified;
  return data;
};
