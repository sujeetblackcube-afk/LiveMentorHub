import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
import { signJwt } from "../utils/jwt.js";
import { generateOTP, verifyOTP, sendOTP } from "../utils/otp.js";
import crypto from "crypto";

import config from "../config/config.js";
import axios from "axios";

const getClientIp = async (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    null;

  // Convert IPv6 format like ::ffff:192.168.1.1 → 192.168.1.1
  if (ip && ip.includes("::ffff:")) {
    ip = ip.split("::ffff:")[1];
  }

  // If localhost (::1 or 127.0.0.1), fetch real public IP using API
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    try {
      const response = await axios.get("https://api.ipify.org?format=json", {
        timeout: 2000,
      });
      ip = response.data.ip;
    } catch (error) {
      console.error("IP fetch API failed:", error.message);
      ip = "UNKNOWN";
    }
  }

  return ip;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Helper function to generate studentId
const generateStudentId = async (firstName) => {
  const now = new Date();

  const dateTime =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  // optional tiny random (VERY important)
  const random = crypto.randomInt(10, 100); // 2 digits

  return `${firstName}${dateTime}${random}`;
};

// Helper function to generate teacherId
const generateTeacherId = async (firstName) => {
  const now = new Date();

  const dateTime =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  // optional tiny random (VERY important)
  const random = crypto.randomInt(10, 100); // 2 digits

  return `${firstName}${dateTime}${random}`;
};

// Helper function to generate parentId

const generateParentId = async (firstName) => {
  const now = new Date();

  const dateTime =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  // optional tiny random (VERY important)
  const random = crypto.randomInt(10, 100); // 2 digits

  return `${firstName}${dateTime}${random}`;
};

// Helper function to generate userId globally
const generateUserId = async () => {
  // Find the maximum userId across all user tables
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

// Student signup
const studentSignup = async (req, res) => {
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

      // 🔹 NEW FIELDS
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // ✅ Validate required fields
    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailInTeacher = await Teacher.findOne({ where: { email } });
    if (emailInTeacher) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Teacher. Please use a different email.",
      });
    }

    const emailInParent = await Parent.findOne({ where: { email } });
    if (emailInParent) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Parent. Please use a different email.",
      });
    }

    const emailInAdmin = await SuperAdmin.findOne({ where: { email } });
    if (emailInAdmin) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as an Admin. Please use a different email.",
      });
    }

    // Check if email or mobile already exists
    // Check exact match (email + mobile)
    const exactStudent = await Student.findOne({
      where: {
        email,
        mobile,
      },
    });

    // Check email only
    const emailStudent = await Student.findOne({
      where: { email },
    });

    // Check mobile only
    const mobileStudent = await Student.findOne({
      where: { mobile },
    });

    // ==============================
    // CASE 1: Exact match but OTP NOT verified
    // ==============================
    if (exactStudent && !exactStudent.otpVerified) {
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await exactStudent.update({ otp, otpExpiresAt });

      // Send OTP via email
      await sendOTP(email, otp);

      return res.status(200).json({
        status: true,
        message: "OTP already sent. Please verify to complete registration",
        studentId: exactStudent.studentId,
        expiresAt: otpExpiresAt,
      });
    }

    // ==============================
    // CASE 2: Exact match & fully registered
    // ==============================
    if (exactStudent && exactStudent.otpVerified) {
      return res.status(400).json({
        status: false,
        message: "User already registered. Please login.",
      });
    }

    // ==============================
    // CASE 3: Only email OR mobile exists
    // ==============================
    if ((emailStudent && !exactStudent) || (mobileStudent && !exactStudent)) {
      return res.status(400).json({
        status: false,
        message: "Email or Mobile already registered.",
      });
    }

    // Extract first name
    const firstName = name.split(" ")[0].toLowerCase();

    // Current year
    const year = new Date().getFullYear();

    // Generate studentId
    const studentId = await generateStudentId(firstName, year);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Check for exact email and mobile match
    let parent = await Parent.findOne({
      where: {
        email: parentEmail,
        mobile: parentMobile,
      },
    });

    let parentId;

    // ✅ Parent exists with exact email and mobile → LINK
    if (parent) {
      parentId = parent.parentId;
    } else {
      // Check if mobile exists but email is different
      const existingParentWithMobile = await Parent.findOne({
        where: {
          mobile: parentMobile,
        },
      });

      if (existingParentWithMobile) {
        return res.status(400).json({
          status: false,
          message:
            "Please register your correct parent email and mobile combination of your parent which is used by your sibling. otherwise use new email and mobile both",
        });
      }

      // Check if email exists but mobile is different
      const existingParentWithEmail = await Parent.findOne({
        where: {
          email: parentEmail,
        },
      });

      if (existingParentWithEmail) {
        return res.status(400).json({
          status: false,
          message:
            "Please register your correct parent email and mobile combination of your parent which is used by your sibling. otherwise use new email and mobile both",
        });
      }

      // ✅ No match at all → CREATE NEW PARENT
      const parentFirstName = parentName.split(" ")[0].toLowerCase();
      const year = new Date().getFullYear();

      parentId = await generateParentId(parentFirstName, year);
      const parentUserId = await generateUserId();

      parent = await Parent.create({
        userId: parentUserId,
        name: parentName,
        email: parentEmail,
        mobile: parentMobile,
        parentId,
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
    }

    // Generate userId for student
    const userId = await generateUserId();

    // Create student
    const student = await Student.create({
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
      parentId, // ✅ LINKED

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

    // Send OTP via email
    await sendOTP(email, otp);

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

// Teacher signup
const teacherSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      qualification,
      country,
      mobile,
      gender,

      // 🔹 NEW FIELDS
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // ✅ Validate required fields
    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailInStudent = await Student.findOne({ where: { email } });
    if (emailInStudent) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Student. Please use a different email.",
      });
    }

    const emailInParent = await Parent.findOne({ where: { email } });
    if (emailInParent) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Parent. Please use a different email.",
      });
    }

    const emailInAdmin = await SuperAdmin.findOne({ where: { email } });
    if (emailInAdmin) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as an Admin. Please use a different email.",
      });
    }

    // ==============================
    // 🔍 CHECK DUPLICATES (Same as Student Logic)
    // ==============================

    // Exact match (email + mobile)
    const exactTeacher = await Teacher.findOne({
      where: {
        email,
        mobile,
      },
    });

    // Email only check
    const emailTeacher = await Teacher.findOne({
      where: { email },
    });

    // Mobile only check
    const mobileTeacher = await Teacher.findOne({
      where: { mobile },
    });

    // ==============================
    // CASE 1: Exact match but OTP NOT verified
    // ==============================
    if (exactTeacher && !exactTeacher.otpVerified) {
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await exactTeacher.update({
        otp,
        otpExpiresAt,
        address,
        lattitude: latitude || null,
        longitude: longitude || null,
        playerId: playerId || null,
        DeviceType: deviceType || null,
      });

      // Send OTP via email
      await sendOTP(email, otp);

      return res.status(200).json({
        status: true,
        message: "OTP already sent. Please verify to complete registration",
        teacherId: exactTeacher.teacherId,
        expiresAt: otpExpiresAt,
      });
    }

    // ==============================
    // CASE 2: Exact match & fully registered
    // ==============================
    if (exactTeacher && exactTeacher.otpVerified) {
      return res.status(400).json({
        status: false,
        message: "Teacher already registered. Please login.",
      });
    }

    // ==============================
    // CASE 3: Only email OR mobile exists (but not exact match)
    // ==============================
    if ((emailTeacher && !exactTeacher) || (mobileTeacher && !exactTeacher)) {
      return res.status(400).json({
        status: false,
        message: "Email or Mobile already registered.",
      });
    }

    // ==============================
    // CREATE NEW TEACHER
    // ==============================

    // Extract first name
    const firstName = name.split(" ")[0].toLowerCase();

    // Current year
    const year = new Date().getFullYear();

    // Generate teacherId
    const teacherId = await generateTeacherId(firstName, year);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Generate userId
    const userId = await generateUserId();

    // Create teacher
    const teacher = await Teacher.create({
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

      // 🔹 NEW FIELDS
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

    // Send OTP via email
    await sendOTP(email, otp);

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

// Parent signup
const parentSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,

      // 🔹 NEW FIELDS
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // ✅ Validate required fields
    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailInStudent = await Student.findOne({ where: { email } });
    if (emailInStudent) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Student. Please use a different email.",
      });
    }

    const emailInTeacher = await Teacher.findOne({ where: { email } });
    if (emailInTeacher) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Teacher. Please use a different email.",
      });
    }

    const emailInAdmin = await SuperAdmin.findOne({ where: { email } });
    if (emailInAdmin) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as an Admin. Please use a different email.",
      });
    }

    // Check if email or mobile already exists
    const existingParent = await Parent.findOne({
      where: {
        [Op.or]: [{ email }, { mobile }],
      },
    });

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

    // Extract first name
    const firstName = name.split(" ")[0].toLowerCase();

    // Get current year
    const year = new Date().getFullYear();

    // Generate parentId
    const parentId = await generateParentId(firstName, year);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Generate userId
    const userId = await generateUserId();

    // Create parent
    const parent = await Parent.create({
      userId,
      name,
      email,
      mobile,
      parentId,
      passwordHash,
      profileImage,

      // 🔹 NEW FIELDS SAVED
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

    // Send OTP via email
    await sendOTP(email, otp);

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

// SuperAdmin signup
const superAdminSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,

      // 🔹 NEW FIELDS
      address,
      latitude,
      longitude,
      playerId,
      deviceType,
    } = req.body;

    // ✅ Validate required fields
    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required",
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    // Cross-role email check
    const emailInStudent = await Student.findOne({ where: { email } });
    if (emailInStudent) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Student. Please use a different email.",
      });
    }

    const emailInTeacher = await Teacher.findOne({ where: { email } });
    if (emailInTeacher) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Teacher. Please use a different email.",
      });
    }

    const emailInParent = await Parent.findOne({ where: { email } });
    if (emailInParent) {
      return res.status(400).json({
        status: false,
        message: "This email is already registered as a Parent. Please use a different email.",
      });
    }

    // Check if email or phone already exists in SuperAdmin
    const existingAdmin = await SuperAdmin.findOne({
      where: {
        [Op.or]: [{ email }, { mobile }],
      },
    });

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
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create super admin
    const superAdmin = await SuperAdmin.create({
      name,
      email,
      mobile,
      passwordHash,
      profileImage,

      // 🔹 NEW FIELDS SAVED
      otp,
      otpExpiresAt,
      otpVerified: false,
      address,
      lattitude: latitude || null,
      longitude: longitude || null,
      playerId: playerId || null,
      deviceType: deviceType || null,
    });

    // Send OTP via email
    await sendOTP(email, otp);

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

// Login
const login = async (req, res) => {
  try {
    const { identifier, password, role, playerId, deviceType } = req.body;

    // =======================
    // GET REAL USER IP (API + HEADERS + FALLBACK)
    // =======================
    const ipAddress = await getClientIp(req);

    if (!role) {
      return res.status(400).json({
        status: false,
        message: "Role is required",
      });
    }

    let user = null;
    let specificId = null;
    let enrollmentStatus = undefined;

    // =======================
    // ROLE BASED LOGIN
    // =======================
    switch (role) {
      case "student":
        user = await Student.findOne({
          where: {
            [Op.or]: [{ email: identifier }, { mobile: identifier }],
          },
        });

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Student not found",
          });
        }

        specificId = user.studentId;

        const enrollment = await Enrollment.findOne({
          where: { studentId: specificId },
        });

        enrollmentStatus = enrollment ? 1 : 0;

        if (["SUSPENDED", "TERMINATED"].includes(user.status)) {
          return res.status(403).json({
            status: false,
            message: `You are ${user.status}. Please contact administration.`,
          });
        }

        if (!user.otpVerified) {
          return res.status(403).json({
            status: false,
            message: "Please verify OTP to complete registration",
          });
        }
        break;

      case "teacher":
        user = await Teacher.findOne({
          where: {
            [Op.or]: [{ email: identifier }, { mobile: identifier }],
          },
        });

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Teacher not found",
          });
        }

        specificId = user.teacherId;

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

        if (!user.otpVerified) {
          return res.status(403).json({
            status: false,
            message: "Please verify OTP to complete registration",
          });
        }
        break;

      case "parent":
        user = await Parent.findOne({
          where: {
            [Op.or]: [{ email: identifier }, { mobile: identifier }],
          },
        });

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Parent not found",
          });
        }

        specificId = user.parentId;

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

        if (!user.otpVerified) {
          return res.status(403).json({
            status: false,
            message:
              "Welcome! Since this is your first login, please reset your password by clicking “Forgot Password” before signing in",
          });
        }
        break;

      case "superadmin":
        user = await SuperAdmin.findOne({
          where: {
            [Op.or]: [{ email: identifier }, { mobile: identifier }],
          },
        });

        if (!user) {
          return res.status(404).json({
            status: false,
            message: "Super admin not found",
          });
        }

        specificId = user.userId;
        break;

      default:
        return res.status(400).json({
          status: false,
          message: "Invalid role",
        });
    }

    // =======================
    // PASSWORD CHECK
    // =======================
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      await Login.create({
        userId: user?.userId || user?.id || null,
        email: identifier || null,
        status: "failed",
        role,
        ipAddress, // ✅ REAL IP STORED
        Devicetype: deviceType,
        playerId,
      });

      return res.status(401).json({
        status: false,
        message: "Incorrect password",
      });
    }

    // =======================
    // SINGLE DEVICE & ACTIVE SESSION CHECK (STUDENT ONLY)
    // =======================
    const { forceLogout } = req.body;

    if (role === "student") {
      const hasActiveSession = Boolean(user.activeWebToken || user.activeAppToken);
      if (hasActiveSession && !forceLogout) {
        return res.status(200).json({
          status: false,
          activeSessionFound: true,
          message: "An active session is currently logged in on another device. Do you want to log out from the other device and continue?",
        });
      }
    }

    // =======================
    // JWT
    // =======================
    const token = signJwt({
      userId: user.userId || user.id,
      role,
      specificId,
    });

    // Save the active token ONLY for student role (enforces single device login for students across all devices)
    if (role === "student") {
      await user.update({
        activeWebToken: token,
        activeAppToken: token,
      });
    }

    // =======================
    // SUCCESS LOGIN LOG WITH REAL IP
    // =======================
    await Login.create({
      userId: user.userId || user.id,
      email: user.email || null,
      mobile: user.mobile || user.phoneNumber || null,
      phoneNumber: user.mobile || user.phoneNumber || null,
      playerId,
      Devicetype: deviceType,
      ipAddress, // ⭐ Now stores public IP instead of ::1
      status: "success",
      role,
      specificId,
      name: user.name,
      profileImage: user.profileImage,
    });

    const userData = { ...user.toJSON() };
    delete userData.passwordHash;
    delete userData.otp;
    delete userData.otpExpiresAt;
    delete userData.otpVerified;

    return res.status(200).json({
      status: true,
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

// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { identifier, role } = req.body; // email or mobile

    let user = null;

    // 🔍 Find user by role
    if (role === "student") {
      user = await Student.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { mobile: identifier }],
        },
      });
    } else if (role === "teacher") {
      user = await Teacher.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { mobile: identifier }],
        },
      });
    } else if (role === "superadmin") {
      user = await SuperAdmin.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { mobile: identifier }],
        },
      });
    } else if (role === "parent") {
      user = await Parent.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { mobile: identifier }],
        },
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid role",
      });
    }

    // ❌ User not found
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Email or mobile not found",
      });
    }

    // 🔐 Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 💾 Save OTP
    await user.update({ otp, otpExpiresAt });

    // 📩 Send OTP (email / sms)
    const sent = await sendOTP(user.email, otp);

    if (!sent) {
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP",
      });
    }

    // ✅ Success response
    return res.status(200).json({
      status: true,
      message: "OTP resent successfully",
      otp, // ⚠️ remove in production
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

const forgotPassword = async (req, res) => {
  try {
    const { identifier, role } = req.body; // email or mobile, role: student, teacher, parent, superadmin

    let user;

    // Determine user model based on role
    if (role === "student") {
      user = await Student.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "teacher") {
      user = await Teacher.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "parent") {
      user = await Parent.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "superadmin") {
      user = await SuperAdmin.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid role",
        reason: "Role must be student, teacher, parent, or superadmin",
      });
    }

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        reason: `${role} with provided email or mobile does not exist`,
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.update({ otp, otpExpiresAt });

    // Send OTP via email
    await sendOTP(identifier, otp);

    // Success response with OTP (for testing/dev)
    res.status(200).json({
      status: true,
      message: "OTP generated for password reset and sent to your email",
      identifier,
      role,
      expiresAt: otpExpiresAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

// Verify OTP for Forgot Password
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier, otp, role } = req.body;

    let user = null;

    // 🔍 Find user by role
    if (role === "student") {
      user = await Student.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "teacher") {
      user = await Teacher.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "parent") {
      user = await Parent.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "superadmin") {
      user = await SuperAdmin.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { mobile: identifier }],
        },
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid role",
      });
    }

    // ❌ User not found
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Email or mobile not found",
      });
    }

    // ❌ Invalid / expired OTP
    const isValid = verifyOTP(otp, user.otp, user.otpExpiresAt);
    if (!isValid) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    // ✅ MARK OTP AS VERIFIED
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

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { identifier, role, newPassword } = req.body;

    let user;

    // 🔍 Find user by role
    if (role === "student") {
      user = await Student.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "teacher") {
      user = await Teacher.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "parent") {
      user = await Parent.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "superadmin") {
      user = await SuperAdmin.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid role",
      });
    }

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // ❌ OTP NOT VERIFIED
    if (!user.otpVerified) {
      return res.status(403).json({
        status: false,
        message: "OTP not verified",
        reason: "Please verify OTP before resetting password",
      });
    }

    // 🔐 Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // ✅ Update password & clear OTP data
    await user.update({
      passwordHash,
      otp: null,
      otpExpiresAt: null,
      otpVerified: true, // allow login with new password
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

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp, role } = req.body; // identifier email or mobile, role: student, teacher, parent, superadmin

    let user;

    // Determine user model based on role
    if (role === "student") {
      user = await Student.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "teacher") {
      user = await Teacher.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "parent") {
      user = await Parent.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else if (role === "superadmin") {
      user = await SuperAdmin.findOne({
        where: { [Op.or]: [{ email: identifier }, { mobile: identifier }] },
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid role",
        reason: "Role must be student, teacher, parent, or superadmin",
      });
    }

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

    // Check OTP validity
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

    // Update otpVerified
    await user.update({ otpVerified: true });

    // Generate JWT
    const specificId =
      user.studentId ||
      user.teacherId ||
      user.parentId ||
      (role === "superadmin" ? user.userId : null);
    const token = signJwt({ userId: user.userId, role, specificId });

    res.status(200).json({
      status: true,
      message: "Account verified successfully",
      token,
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Server error",
      reason: error.message,
    });
  }
};

// Note: signup, verifyOtp, getUsers, upload are not defined in this file, but used in routes. Assuming they are missing or need to be added.
export {
  studentSignup,
  teacherSignup,
  parentSignup,
  superAdminSignup,
  login,
  resendOtp,
  verifyOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
};
