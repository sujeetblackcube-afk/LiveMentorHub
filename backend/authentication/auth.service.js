/**
 * Authentication Service
 * Contains business logic and helper functions for authentication
 */

import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import pkg from 'sequelize';
const { Op } = pkg;

import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Parent from "../models/Parent.js";
import SuperAdmin from "../models/SuperAdmin.js";
import Login from "../models/Login.js";
import Enrollment from "../models/Enrollment.js";
import { generateOTP, verifyOTP, sendOTP } from "../utils/otp.js";
import {
  getClientIp,
  generateStudentId,
  generateTeacherId,
  generateParentId,
  hashPassword,
  comparePasswords,
  generateAndSendOTP,
  isOtpValid,
} from "./auth.utils.js";

/**
 * Configure multer for file uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

/**
 * Generate global User ID
 * Finds max userId across all user tables and increments
 * @returns {Promise<number>} Next available user ID
 */
export const generateUserId = async () => {
  const models = [Student, Teacher, Parent];
  let maxUserId = 0;

  for (const model of models) {
    const lastUser = await model.findOne({
      order: [["userId", "DESC"]],
      attributes: ["userId"],
    });
    if (lastUser && lastUser.userId && lastUser.userId > maxUserId) {
      maxUserId = lastUser.userId;
    }
  }

  return maxUserId + 1;
};

/**
 * Check if email exists in any user role
 * @param {string} email - Email to check
 * @param {string} excludeRole - Role to exclude from check
 * @returns {Promise<Object|null>} User object if found, null otherwise
 */
export const checkEmailExists = async (email, excludeRole = null) => {
  if (excludeRole !== "student") {
    const student = await Student.findOne({ where: { email } });
    if (student) return { user: student, role: "student" };
  }

  if (excludeRole !== "teacher") {
    const teacher = await Teacher.findOne({ where: { email } });
    if (teacher) return { user: teacher, role: "teacher" };
  }

  if (excludeRole !== "parent") {
    const parent = await Parent.findOne({ where: { email } });
    if (parent) return { user: parent, role: "parent" };
  }

  if (excludeRole !== "superadmin") {
    const admin = await SuperAdmin.findOne({ where: { email } });
    if (admin) return { user: admin, role: "superadmin" };
  }

  return null;
};

/**
 * Find user by identifier (email or mobile) and role
 * @param {string} identifier - Email or mobile number
 * @param {string} role - User role (student, teacher, parent, superadmin)
 * @returns {Promise<Object|null>} User object if found
 */
export const findUserByIdentifier = async (identifier, role) => {
  const query = {
    where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
  };

  switch (role) {
    case "student":
      return await Student.findOne(query);
    case "teacher":
      return await Teacher.findOne(query);
    case "parent":
      return await Parent.findOne(query);
    case "superadmin":
      return await SuperAdmin.findOne(query);
    default:
      return null;
  }
};

export const findStudentByEmailAndMobile = async (email, mobile) => {
  return await Student.findOne({ where: { email, mobile } });
};

export const findStudentByEmail = async (email) => {
  return await Student.findOne({ where: { email } });
};

export const findStudentByMobile = async (mobile) => {
  return await Student.findOne({ where: { mobile } });
};

export const findTeacherByEmailAndMobile = async (email, mobile) => {
  return await Teacher.findOne({ where: { email, mobile } });
};

export const findTeacherByEmail = async (email) => {
  return await Teacher.findOne({ where: { email } });
};

export const findTeacherByMobile = async (mobile) => {
  return await Teacher.findOne({ where: { mobile } });
};

export const findParentByEmailAndMobile = async (email, mobile) => {
  return await Parent.findOne({
    where: { [Op.or]: [{ email }, { mobile }] },
  });
};

export const findParentByEmail = async (email) => {
  return await Parent.findOne({ where: { email } });
};

export const findParentByMobile = async (mobile) => {
  return await Parent.findOne({ where: { mobile } });
};

export const findSuperAdminByEmailAndMobile = async (email, mobile) => {
  return await SuperAdmin.findOne({
    where: { [Op.or]: [{ email }, { mobile }] },
  });
};

export const createParentRecord = async (data) => {
  return await Parent.create(data);
};

export const createStudentRecord = async (data) => {
  return await Student.create(data);
};

export const createTeacherRecord = async (data) => {
  return await Teacher.create(data);
};

export const createSuperAdminRecord = async (data) => {
  return await SuperAdmin.create(data);
};

export const createLoginRecord = async (data) => {
  return await Login.create(data);
};

export const updateUserSession = async (user, data) => {
  return await user.update(data);
};

export const findEnrollmentForStudent = async (studentId) => {
  return await Enrollment.findOne({
    where: {
      studentId,
      status: { [Op.in]: ["APPROVED", "PASSOUT"] },
    },
  });
};

export const sanitizeUserData = (user) => {
  const userData = { ...user.toJSON() };
  delete userData.passwordHash;
  delete userData.otp;
  delete userData.otpExpiresAt;
  delete userData.otpVerified;
  return userData;
};

export {
  getClientIp,
  generateStudentId,
  generateTeacherId,
  generateParentId,
  hashPassword,
  comparePasswords,
  generateAndSendOTP,
  isOtpValid,
};
