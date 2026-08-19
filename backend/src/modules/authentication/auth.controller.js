/**
 * Authentication Controller
 * Handles all authentication-related HTTP requests
 */

import pkg from 'sequelize';
const { Op } = pkg;
import { Student, Teacher, Parent, SuperAdmin } from '../../models/index.js';
import { signJwt } from '../../utils/jwt.js';
import { verifyOTP } from '../../utils/otp.js';
import {
  getClientIp,
  generateStudentId,
  generateTeacherId,
  generateParentId,
  generateUserId,
  hashPassword,
  comparePasswords,
  generateAndSendOTP,
  findUserByIdentifier,
  checkEmailExists,
  findStudentByEmailAndMobile,
  findStudentByEmail,
  findStudentByMobile,
  findTeacherByEmailAndMobile,
  findTeacherByEmail,
  findTeacherByMobile,
  findParentByEmailAndMobile,
  findParentByEmail,
  findParentByMobile,
  findSuperAdminByEmailAndMobile,
  createParentRecord,
  createStudentRecord,
  createTeacherRecord,
  createSuperAdminRecord,
  createLoginRecord,
  updateUserSession,
  findEnrollmentForStudent,
  sanitizeUserData,
} from "./auth.service.js";

/**
 * Student Signup
 * POST /api/auth/register/student
 * Creates a new student account and sends OTP for verification
 */
export const studentSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      parentName,
      parentEmail,
      parentMobile,
      password,
      country,
      gender,
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !parentName || !parentEmail || !parentMobile || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email, mobile, parent name, parent email, parent mobile, and password are required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailExists = await checkEmailExists(email, "student");
    if (emailExists) {
      return res.status(400).json({
        status: false,
        message: `This email is already registered as a ${emailExists.role}. Please use a different email.`,
      });
    }

    // Check if email or mobile already exists in Student
    const exactStudent = await findStudentByEmailAndMobile(email, mobile);

    if (exactStudent && !exactStudent.otpVerified) {
      const { otp, otpExpiresAt } = await generateAndSendOTP(email);
      await exactStudent.update({ otp, otpExpiresAt });

      return res.status(200).json({
        status: true,
        message: "OTP already sent. Please verify to complete registration",
        studentId: exactStudent.studentId,
        expiresAt: otpExpiresAt,
      });
    }

    if (exactStudent && exactStudent.otpVerified) {
      return res.status(400).json({
        status: false,
        message: "User already registered. Please login.",
      });
    }

    // Check if email OR mobile exists separately
    const emailStudent = await findStudentByEmail(email);
    const mobileStudent = await findStudentByMobile(mobile);

    if ((emailStudent && !exactStudent) || (mobileStudent && !exactStudent)) {
      return res.status(400).json({
        status: false,
        message: "Email or Mobile already registered.",
      });
    }

    // Generate student ID
    const firstName = name.split(" ")[0].toLowerCase();
    const studentId = await generateStudentId(firstName);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate OTP
    const { otp, otpExpiresAt } = await generateAndSendOTP(email);

    // Handle parent association
    let parent = await findParentByEmailAndMobile(parentEmail, parentMobile);

    let parentId;

    if (parent) {
      parentId = parent.parentId;
    } else {
      // Check for partial matches
      const existingParentWithMobile = await findParentByMobile(parentMobile);

      if (existingParentWithMobile) {
        return res.status(400).json({
          status: false,
          message:
            "Please register your correct parent email and mobile combination of your parent which is used by your sibling. otherwise use new email and mobile both",
        });
      }

      const existingParentWithEmail = await findParentByEmail(parentEmail);

      if (existingParentWithEmail) {
        return res.status(400).json({
          status: false,
          message:
            "Please register your correct parent email and mobile combination of your parent which is used by your sibling. otherwise use new email and mobile both",
        });
      }

      // Create new parent
      const parentFirstName = parentName.split(" ")[0].toLowerCase();
      const parentIdNew = await generateParentId(parentFirstName);
      const parentUserId = await generateUserId();

      parent = await createParentRecord({
        userId: parentUserId,
        name: parentName,
        email: parentEmail,
        mobile: parentMobile,
        parentId: parentIdNew,
        passwordHash,
        address,
        country,
        lattitude: latitude || null,
        longitude: longitude || null,
        playerId: playerId || null,
        DeviceType: deviceType || null,
        status: "APPROVED",
        otp,
        otpExpiresAt,
        otpVerified: false,
      });

      parentId = parentIdNew;
    }

    // Create student
    const userId = await generateUserId();

    await createStudentRecord({
      userId,
      name,
      email,
      mobile,
      gender,
      studentId,
      profileImage,
      parentName,
      parentEmail,
      parentMobile,
      parentId,
      passwordHash,
      country,
      address,
      lattitude: latitude || null,
      longitude: longitude || null,
      playerId: playerId || null,
      DeviceType: deviceType || null,
      status: "APPROVED",
      otp,
      otpExpiresAt,
      otpVerified: false,
    });

    return res.status(201).json({
      status: true,
      message: "OTP generated successfully and sent to your email",
      studentId,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

/**
 * Teacher Signup
 * POST /api/auth/register/teacher
 * Creates a new teacher account and sends OTP for verification
 */
export const teacherSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      qualification,
      country,
      mobile,
      gender,
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email, mobile, and password are required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailExists = await checkEmailExists(email, "teacher");
    if (emailExists) {
      return res.status(400).json({
        status: false,
        message: `This email is already registered as a ${emailExists.role}. Please use a different email.`,
      });
    }

    // Check duplicates
    const exactTeacher = await findTeacherByEmailAndMobile(email, mobile);

    if (exactTeacher && !exactTeacher.otpVerified) {
      const { otp, otpExpiresAt } = await generateAndSendOTP(email);
      await exactTeacher.update({
        otp,
        otpExpiresAt,
        address,
        lattitude: latitude || null,
        longitude: longitude || null,
        playerId: playerId || null,
        DeviceType: deviceType || null,
      });

      return res.status(200).json({
        status: true,
        message: "OTP already sent. Please verify to complete registration",
        teacherId: exactTeacher.teacherId,
        expiresAt: otpExpiresAt,
      });
    }

    if (exactTeacher && exactTeacher.otpVerified) {
      return res.status(400).json({
        status: false,
        message: "Teacher already registered. Please login.",
      });
    }

    // Check email/mobile separately
    const emailTeacher = await findTeacherByEmail(email);
    const mobileTeacher = await findTeacherByMobile(mobile);

    if ((emailTeacher && !exactTeacher) || (mobileTeacher && !exactTeacher)) {
      return res.status(400).json({
        status: false,
        message: "Email or Mobile already registered.",
      });
    }

    // Generate teacher ID
    const firstName = name.split(" ")[0].toLowerCase();
    const teacherId = await generateTeacherId(firstName);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate OTP
    const { otp, otpExpiresAt } = await generateAndSendOTP(email);

    // Generate user ID
    const userId = await generateUserId();

    // Create teacher
    await createTeacherRecord({
      userId,
      name,
      email,
      mobile,
      gender,
      teacherId,
      passwordHash,
      qualification,
      country,
      profileImage,
      address,
      lattitude: latitude || null,
      longitude: longitude || null,
      playerId: playerId || null,
      DeviceType: deviceType || null,
      status: "PENDING",
      coursename: [],
      courseCode: [],
      otp,
      otpExpiresAt,
      otpVerified: false,
    });

    return res.status(201).json({
      status: true,
      message: "OTP generated successfully and sent to your email",
      teacherId,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

/**
 * Parent Signup
 * POST /api/auth/register/parent
 * Creates a new parent account and sends OTP for verification
 */
export const parentSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email, mobile, and password are required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailExists = await checkEmailExists(email, "parent");
    if (emailExists) {
      return res.status(400).json({
        status: false,
        message: `This email is already registered as a ${emailExists.role}. Please use a different email.`,
      });
    }

    // Check if email or mobile already exists
    const existingParent = await findParentByEmailAndMobile(email, mobile);

    if (existingParent) {
      let reason = "";
      if (existingParent.email === email) reason = "Email already registered";
      else if (existingParent.mobile === mobile)
        reason = "Mobile already registered";

      return res.status(400).json({
        status: false,
        message: "Signup failed",
        reason,
      });
    }

    // Generate parent ID
    const firstName = name.split(" ")[0].toLowerCase();
    const parentId = await generateParentId(firstName);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate OTP
    const { otp, otpExpiresAt } = await generateAndSendOTP(email);

    // Generate user ID
    const userId = await generateUserId();

    // Create parent
    await createParentRecord({
      userId,
      name,
      email,
      mobile,
      parentId,
      passwordHash,
      profileImage,
      address,
      lattitude: latitude || null,
      longitude: longitude || null,
      playerId: playerId || null,
      deviceType: deviceType || null,
      status: "APPROVED",
      otp,
      otpExpiresAt,
      otpVerified: false,
    });

    return res.status(201).json({
      status: true,
      message: "OTP generated successfully and sent to your email",
      parentId,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

/**
 * SuperAdmin Signup
 * POST /api/auth/register/superadmin
 * Creates a new super admin account and sends OTP for verification
 */
export const superAdminSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email, mobile, and password are required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailExists = await checkEmailExists(email, "superadmin");
    if (emailExists) {
      return res.status(400).json({
        status: false,
        message: `This email is already registered as a ${emailExists.role}. Please use a different email.`,
      });
    }

    // Check if email or mobile already exists in SuperAdmin
    const existingAdmin = await findSuperAdminByEmailAndMobile(email, mobile);

    if (existingAdmin) {
      let reason = "";
      if (existingAdmin.email === email) reason = "Email already registered";
      else if (existingAdmin.mobile === mobile)
        reason = "Mobile already registered";

      return res.status(400).json({
        status: false,
        message: "Signup failed",
        reason,
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate OTP
    const { otp, otpExpiresAt } = await generateAndSendOTP(email);

    // Create super admin
    const superAdmin = await createSuperAdminRecord({
      name,
      email,
      mobile,
      passwordHash,
      profileImage,
      otp,
      otpExpiresAt,
      otpVerified: false,
      address,
      lattitude: latitude || null,
      longitude: longitude || null,
      playerId: playerId || null,
      deviceType: deviceType || null,
    });

    // Generate JWT
    const token = signJwt({
      userId: superAdmin.userId,
      role: "superadmin",
      specificId: superAdmin.userId,
    });

    return res.status(201).json({
      status: true,
      message: "SuperAdmin registered successfully and OTP sent to your email",
      userId: superAdmin.userId,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

/**
 * Login
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
export const login = async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.email || req.body.mobile;
    const { password, role, playerId, deviceType, forceLogout } = req.body;
    const identifier = rawIdentifier;

    // Get client IP
    const ipAddress = await getClientIp(req);

    if (!identifier || !password) {
      return res.status(400).json({
        status: false,
        message: "Identifier, email, or mobile and password are required",
      });
    }

    let normRole = role ? String(role).trim().toLowerCase() : null;
    if (!normRole) {
      const detectedUser = await findUserByIdentifier(identifier, null);
      normRole = detectedUser ? detectedUser.role.toLowerCase() : "teacher";
    }

    let user = null;
    let specificId = null;
    let enrollmentStatus = undefined;

    // Role-based login
    switch (normRole) {
      case "student": {
        user = await findUserByIdentifier(identifier, "student");

        if (!user) {
          user = await findUserByIdentifier(identifier, null);
        }

        if (!user) {
          const cleanId = (identifier || '').trim();
          const digits = cleanId.replace(/\D/g, '');
          const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
          user = await Student.findOne({
            where: {
              [Op.or]: [
                { email: cleanId },
                { email: cleanId.toLowerCase() },
                { mobile: cleanId },
                { mobile: `+91${last10}` },
                { mobile: last10 }
              ]
            }
          }) || await Teacher.findOne({
            where: {
              [Op.or]: [
                { email: cleanId },
                { email: cleanId.toLowerCase() },
                { mobile: cleanId },
                { mobile: `+91${last10}` },
                { mobile: last10 }
              ]
            }
          });
        }

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Student not found",
          });
        }

        specificId = user.studentId;

        // Check enrollment status
        const enrollment = await findEnrollmentForStudent(specificId);

        enrollmentStatus = enrollment ? 1 : 0;

        // Check account status
        if (["SUSPENDED", "TERMINATED"].includes(user.status)) {
          return res.status(403).json({
            status: false,
            message: `You are ${user.status}. Please contact administration.`,
          });
        }

        // Check OTP verification
        if (!user.otpVerified) {
          return res.status(403).json({
            status: false,
            message: "Please verify OTP to complete registration",
          });
        }

        // Check active session (single device login)
        const hasActiveSession = Boolean(user.isLoggedIn || user.activeToken);
        if (hasActiveSession && !forceLogout) {
          return res.status(200).json({
            status: false,
            activeSessionFound: true,
            message: "An active session is currently logged in on another device. Do you want to log out from the other device and continue?",
          });
        }
        break;
      }

      case "teacher": {
        user = await findUserByIdentifier(identifier, "teacher");

        if (!user) {
          user = await findUserByIdentifier(identifier, null);
        }

        if (!user) {
          const cleanId = (identifier || '').trim();
          const digits = cleanId.replace(/\D/g, '');
          const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
          user = await Teacher.findOne({
            where: {
              [Op.or]: [
                { email: cleanId },
                { email: cleanId.toLowerCase() },
                { mobile: cleanId },
                { mobile: `+91${last10}` },
                { mobile: last10 }
              ]
            }
          });
        }

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Teacher not found",
          });
        }

        specificId = user.teacherId;

        // Check account status
        if (user.status === "PENDING") {
          return res.status(403).json({
            status: false,
            message: "You are not verified. Contact administration.",
          });
        }

        if (["SUSPENDED", "TERMINATED"].includes(user.status)) {
          return res.status(403).json({
            status: false,
            message: `You are ${user.status}. Please contact administration.`,
          });
        }

        // Check OTP verification
        if (!user.otpVerified) {
          return res.status(403).json({
            status: false,
            message: "Please verify OTP to complete registration",
          });
        }
        break;
      }

      case "parent": {
        user = await findUserByIdentifier(identifier, "parent");

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Parent not found",
          });
        }

        specificId = user.parentId;

        // Check account status
        if (user.status === "PENDING") {
          return res.status(403).json({
            status: false,
            message: "Please contact administration to get approved.",
          });
        }

        if (["SUSPENDED", "TERMINATED"].includes(user.status)) {
          return res.status(403).json({
            status: false,
            message: `You are ${user.status}. Please contact administration.`,
          });
        }

        // Check OTP verification
        if (!user.otpVerified) {
          return res.status(403).json({
            status: false,
            message:
              "Welcome! Since this is your first login, please reset your password by clicking \"Forgot Password\" before signing in",
          });
        }
        break;
      }

      case "superadmin": {
        user = await findUserByIdentifier(identifier, "superadmin");

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Super admin not found",
          });
        }

        specificId = user.userId;
        break;
      }

      default:
        return res.status(400).json({
          status: false,
          message: "Invalid role",
        });
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.passwordHash);

    if (!isValidPassword) {
      await createLoginRecord({
        userId: user?.userId || user?.id || null,
        email: identifier || null,
        status: "failed",
        role,
        ipAddress,
        Devicetype: deviceType,
        playerId,
      });

      return res.status(401).json({
        status: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT
    const token = signJwt({
      userId: user.userId || user.id,
      role,
      specificId,
    });

    // Save token for students (single device login)
    if (role === "student") {
      await updateUserSession(user, {
        activeToken: token,
        isLoggedIn: true,
      });
    }

    // Log successful login
    await createLoginRecord({
      userId: user.userId || user.id,
      email: user.email || null,
      mobile: user.mobile || user.phoneNumber || null,
      phoneNumber: user.mobile || user.phoneNumber || null,
      playerId,
      Devicetype: deviceType,
      ipAddress,
      status: "success",
      role,
      specificId,
      name: user.name,
      profileImage: user.profileImage,
    });

    // Return response
    const userData = sanitizeUserData(user);

    return res.status(200).json({
      status: true,
      isDeviceActive: role === "student" ? true : undefined,
      isActiveDevice: role === "student" ? true : undefined,
      isSessionActive: role === "student" ? true : undefined,
      message: "Login successful",
      token,
      role,
      enrollmentStatus: role === "student" ? enrollmentStatus : undefined,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 * Verifies OTP sent during signup
 */
export const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp, role } = req.body;

    let user = await findUserByIdentifier(identifier, role);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        reason: `${role} with provided email or mobile does not exist`,
      });
    }

    if (user.otpVerified) {
      return res.status(400).json({
        status: false,
        message: "Account already verified",
        reason: "OTP has already been verified for this account",
      });
    }

    // Validate OTP
    if (!user.otp || !user.otpExpiresAt || user.otp !== otp) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP",
        reason: "OTP does not match",
      });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({
        status: false,
        message: "OTP expired",
        reason: "OTP has expired, please request a new one",
      });
    }

    // Generate JWT
    const specificId =
      user.studentId ||
      user.teacherId ||
      user.parentId ||
      (role === "superadmin" ? user.userId : null);
    const token = signJwt({ userId: user.userId, role, specificId });

    // Update user
    if (role === "student") {
      await user.update({
        otpVerified: true,
        activeToken: token,
        isLoggedIn: true,
      });
    } else {
      await user.update({ otpVerified: true });
    }

    return res.status(200).json({
      status: true,
      message: "Account verified successfully",
      token,
      role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 * Resends OTP for verification
 */
export const resendOtp = async (req, res) => {
  try {
    const { identifier, role } = req.body;

    let user = await findUserByIdentifier(identifier, role);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Email or mobile not found",
      });
    }

    // Generate and send new OTP
    const { otp, otpExpiresAt } = await generateAndSendOTP(user.email);

    // Update user with new OTP
    await user.update({ otp, otpExpiresAt });

    return res.status(200).json({
      status: true,
      message: "OTP resent successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 * Initiates forgot password flow by sending OTP
 */
export const forgotPassword = async (req, res) => {
  try {
    const { identifier, role } = req.body;

    let user = await findUserByIdentifier(identifier, role);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        reason: `${role} with provided email or mobile does not exist`,
      });
    }

    // Generate and send OTP
    const { otp, otpExpiresAt } = await generateAndSendOTP(user.email);

    // Update user with OTP
    await user.update({ otp, otpExpiresAt });

    return res.status(200).json({
      status: true,
      message: "OTP generated for password reset and sent to your email",
      identifier,
      role,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

/**
 * Verify Forgot Password OTP
 * POST /api/auth/verify-forgot-password-otp
 * Verifies OTP for password reset
 */
export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier, otp, role } = req.body;

    let user = await findUserByIdentifier(identifier, role);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Email or mobile not found",
      });
    }

    // Validate OTP
    if (!verifyOTP(otp, user.otp, user.otpExpiresAt)) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as verified
    await user.update({
      otpVerified: true,
    });

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Reset Password
 * POST /api/auth/reset-password
 * Resets user password after OTP verification
 */
export const resetPassword = async (req, res) => {
  try {
    const { identifier, role, newPassword } = req.body;

    let user = await findUserByIdentifier(identifier, role);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check OTP verification
    if (!user.otpVerified) {
      return res.status(403).json({
        status: false,
        message: "OTP not verified",
        reason: "Please verify OTP before resetting password",
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await user.update({
      passwordHash,
      otp: null,
      otpExpiresAt: null,
      otpVerified: true,
    });

    return res.status(200).json({
      status: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

/**
 * Logout
 * POST /api/auth/logout
 * Logs out user by clearing active token
 */
export const logout = async (req, res) => {
  try {
    const role = req.auth?.role;
    const user = req.user;

    if (user && role === "student") {
      await user.update({
        activeToken: null,
        isLoggedIn: false,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      status: false,
      message: "Logout failed",
      reason: error.message,
    });
  }
};

/**
 * Verify Token
 * GET /api/auth/verify-token
 * Verifies JWT token and returns user info
 */
export const verifyToken = async (req, res) => {
  try {
    const role = req.auth?.role;
    const isStudent = role === "student";

    return res.status(200).json({
      status: true,
      isDeviceActive: isStudent ? true : undefined,
      isActiveDevice: isStudent ? true : undefined,
      isSessionActive: isStudent ? true : undefined,
      message: "Token is valid and active",
      user: req.user,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return res.status(500).json({
      status: false,
      message: "Token verification failed",
      reason: error.message,
    });
  }
};
