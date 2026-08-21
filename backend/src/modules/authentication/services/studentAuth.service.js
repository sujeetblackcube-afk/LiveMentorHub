import { Student, StudentOtp, StudentToken, Enrollment } from '../../../models/index.js';
import { hashPassword, comparePasswords, generateAndSendOTP } from '../auth.utils.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../utils/jwt.js';
import pkg from 'sequelize';
const { Op } = pkg;

export const findStudentByIdentifier = async (identifier) => {
  return await Student.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { mobile: identifier }],
    },
  });
};

export const createStudentAccount = async (data) => {
  return await Student.create(data);
};

export const createStudentOtpRecord = async (studentId, identifier, otpCode, otpType = 'SIGNUP') => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return await StudentOtp.create({
    studentId,
    identifier,
    otpCode,
    otpType,
    expiresAt,
    isUsed: false,
  });
};

export const createStudentTokenSession = async (studentId, deviceType, playerId, ipAddress) => {
  const payload = { specificId: studentId, role: 'student' };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await StudentToken.create({
    studentId,
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

export const getStudentEnrollmentStatus = async (studentId) => {
  const enrollment = await Enrollment.findOne({
    where: {
      studentId,
      status: { [Op.in]: ['APPROVED', 'PASSOUT'] },
    },
  });
  return enrollment ? enrollment.status : 'NOT_ENROLLED';
};

export const sanitizeStudentData = (student) => {
  if (!student) return null;
  const data = typeof student.toJSON === 'function' ? student.toJSON() : { ...student };
  delete data.passwordHash;
  delete data.otp;
  delete data.otpExpiresAt;
  delete data.otpVerified;
  return data;
};
