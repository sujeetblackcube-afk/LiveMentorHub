import pkg from 'sequelize';
const { Op } = pkg;
import Student from "../models/Student.js";
import Livesession from "../models/Livesession.js";
import Enrollment from "../models/Enrollment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import TestSubmission from "../models/TestSubmission.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import { getPaginatedData } from "../utils/pagination.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.memoryStorage();

const uploadProfile = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

export { uploadProfile };

// Get all students (with optional pagination and name search)
const getAllStudents = async (req, res) => {
  try {
    const { status, startDate, endDate, page, limit, search } = req.query;

    const whereClause = {};

    // filter by status
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // filter by search term (name)
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

    // filter by date range (updatedAt for status changes)
    if (startDate && endDate) {
      whereClause.updatedAt = {
        [Op.between]: [
          new Date(`${startDate} 00:00:00`),
          new Date(`${endDate} 23:59:59`),
        ],
      };
    } else if (startDate) {
      whereClause.updatedAt = {
        [Op.gte]: new Date(`${startDate} 00:00:00`),
      };
    } else if (endDate) {
      whereClause.updatedAt = {
        [Op.lte]: new Date(`${endDate} 23:59:59`),
      };
    }

    const queryOptions = {
      where: whereClause,
      attributes: {
        exclude: [
          "passwordHash",
          "otp",
          "otpExpiresAt",
          "playerId",
          "userId",
        ],
      },
      include: [
        {
          model: Enrollment,
          as: "enrollments",
          attributes: ["courseName", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    // If page parameter is supplied, return paginated data
    if (page) {
      const paginatedResult = await getPaginatedData(
        Student,
        queryOptions,
        page,
        limit || 10
      );
      return res.status(200).json({
        status: true,
        message: "Students fetched successfully",
        data: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    // Otherwise return all students (e.g. for exports/downloads)
    const students = await Student.findAll(queryOptions);

    return res.status(200).json({
      status: true,
      message: "Students fetched successfully",
      data: students,
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

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        status: false,
        message: "studentId is required",
      });
    }

    const student = await Student.findByPk(studentId, {
      attributes: {
        exclude: [
          "passwordHash",
          "otp",
          "otpExpiresAt",
          "createdAt",
          "updatedAt",
          "playerId",
          "userId",
        ],
      },
    });

    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update student status
const updateStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["APPROVED", "SUSPENDED", "TERMINATED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value",
      });
    }

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    student.status = status;
    await student.save();

    return res.status(200).json({
      status: true,
      message: "Student status updated successfully",
      data: student,
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

// Update student details
const updateStudentData = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      name,
      address,
      country,
      lattitude,
      longitude,
      gender,
      dateOfBirth,
      schoolName,
      board,
      classGrade,
      guardianRelationship,
      subjectsRequired,
      tuitionType,
      preferredTiming,
      preferredDays,
      lastExamPercentage,
      areasOfImprovement,
      specialLearningNeeds,
      deviceAvailable,
      internetConnectivity,
    } = req.body || {};

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // Validate required fields
    if (name !== undefined && (!name || name.trim() === "")) {
      return res.status(400).json({
        status: false,
        message: "Name cannot be empty",
      });
    }
    if (address !== undefined && (!address || address.trim() === "")) {
      return res.status(400).json({
        status: false,
        message: "Address cannot be empty",
      });
    }
    if (country !== undefined && (!country || country.trim() === "")) {
      return res.status(400).json({
        status: false,
        message: "Country cannot be empty",
      });
    }

    if (lattitude !== undefined && isNaN(lattitude)) {
      return res.status(400).json({
        status: false,
        message: "Latitude must be a valid number",
      });
    }

    if (longitude !== undefined && isNaN(longitude)) {
      return res.status(400).json({
        status: false,
        message: "Longitude must be a valid number",
      });
    }

    // ===== Update Fields =====
    if (name !== undefined) student.name = name.trim();
    if (address !== undefined) student.address = address.trim();
    if (country !== undefined) student.country = country.trim();

    if (lattitude !== undefined) student.lattitude = lattitude;
    if (longitude !== undefined) student.longitude = longitude;
    if (gender !== undefined) student.gender = gender;
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;

    if (schoolName !== undefined) student.schoolName = schoolName;

    if (board !== undefined) student.board = board;
    if (classGrade !== undefined) student.classGrade = classGrade;

    if (guardianRelationship !== undefined)
      student.guardianRelationship = guardianRelationship;
    if (subjectsRequired !== undefined)
      student.subjectsRequired = subjectsRequired;
    if (tuitionType !== undefined) student.tuitionType = tuitionType;

    if (preferredTiming !== undefined)
      student.preferredTiming = preferredTiming;

    if (preferredDays !== undefined) student.preferredDays = preferredDays;

    if (lastExamPercentage !== undefined)
      student.lastExamPercentage = lastExamPercentage;

    if (areasOfImprovement !== undefined)
      student.areasOfImprovement = areasOfImprovement;

    if (specialLearningNeeds !== undefined)
      student.specialLearningNeeds = specialLearningNeeds;

    if (deviceAvailable !== undefined)
      student.deviceAvailable = deviceAvailable;

    if (internetConnectivity !== undefined)
      student.internetConnectivity = internetConnectivity;

    // Handle profile image upload
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, `student/${studentId}`, 'image');
      student.profileImage = result.secure_url;
    }

    await student.save();

    return res.status(200).json({
      status: true,
      message: "Student data updated successfully",
      data: student,
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

// Get student count
const getStudentCount = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {};

    // Filter by status if provided
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const count = await Student.count({
      where: whereClause,
    });

    return res.status(200).json({
      status: true,
      message: "Student count fetched successfully",
      data: { count },
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

// Get student live sessions
const getStudentLiveSessions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    // Get enrolled course codes for the student
    const enrollments = await Enrollment.findAll({
      where: {
        studentId: studentId,
        status: "APPROVED",
      },
      attributes: ["courseCode", "teacherId"],
    });

    if (enrollments.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No enrolled courses found",
        data: [],
      });
    }

    const wherePairs = enrollments.map((enr) => ({
      [Op.and]: [{ courseCode: enr.courseCode }, { teacherId: enr.teacherId }],
    }));

    // Update session statuses based on current time
    const currentTime = new Date();

    // Update upcoming to ongoing
    await Livesession.update(
      { status: "ongoing" },
      {
        where: {
          status: "upcoming",
          startTime: {
            [Op.lte]: currentTime,
          },
        },
      },
    );

    // Update ongoing to completed
    await Livesession.update(
      { status: "completed" },
      {
        where: {
          status: "ongoing",
          endTime: {
            [Op.lt]: currentTime,
          },
        },
      },
    );

    const whereClause = {
      [Op.or]: wherePairs,
    };

    // Filter by status if provided
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const liveSessions = await Livesession.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Live sessions fetched successfully",
      data: liveSessions,
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

// Get student progress
const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        status: false,
        message: "studentId is required",
      });
    }

    // Get student's enrolled courses to find allotted tests and assignments
    const enrollments = await Enrollment.findAll({
      where: { studentId, status: "APPROVED" },
      attributes: ["courseCode", "teacherId"],
    });

    const courseCodes = enrollments.map((e) => e.courseCode);

    // Get all tests and assignments allotted for enrolled courses
    let testsAllotted = 0;
    let assignmentsAllotted = 0;
    let allottedTests = [];
    let allottedAssignments = [];

    if (courseCodes.length > 0) {
      // Get tests allotted for enrolled courses
      const Test = (await import("../models/Test.js")).default;
      const tests = await Test.findAll({
        where: {
          courseCode: { [Op.in]: courseCodes },
        },
      });
      testsAllotted = tests.length;
      allottedTests = tests.map((t) => ({
        id: t.id,
        title: t.title,
        courseCode: t.courseCode,
        totalMarks: t.totalMarks,
        status: t.isPublished ? "Published" : "Unpublished",
      }));

      // Get assignments allotted for enrolled courses
      const Assignment = (await import("../models/Assignment.js")).default;
      const assignments = await Assignment.findAll({
        where: {
          courseCode: { [Op.in]: courseCodes },
        },
      });
      assignmentsAllotted = assignments.length;
      allottedAssignments = assignments.map((a) => ({
        id: a.id,
        title: a.title,
        courseCode: a.courseCode,
        totalMarks: a.totalMarks,
        dueDate: a.dueDate,
      }));
    }

    // Get all assignment submissions for the student
    const assignmentSubmissions = await AssignmentSubmission.findAll({
      where: { studentId },
    });

    // Count assignments submitted (status: submitted or checked)
    const assignmentsSubmitted = assignmentSubmissions.filter(
      (sub) => sub.status === "submitted" || sub.status === "checked",
    ).length;

    const assignmentsNotSubmitted = assignmentsAllotted - assignmentsSubmitted;

    // Get assignment submission details
    const submittedAssignments = assignmentSubmissions
      .filter((sub) => sub.status === "submitted" || sub.status === "checked")
      .map((sub) => ({
        id: sub.id,
        assignmentId: sub.assignmentId,
        title: sub.submissionText || "Assignment",
        status: sub.status,
        obtainedMarks: sub.obtainedMarks,
        percentage: sub.percentage,
        submittedAt: sub.submittedAt,
      }));

    // Get all test submissions for the student
    const testSubmissions = await TestSubmission.findAll({
      where: { studentId },
    });

    // Count tests submitted (status: SUBMITTED or GRADED)
    const testsSubmitted = testSubmissions.filter(
      (sub) => sub.status === "SUBMITTED" || sub.status === "GRADED",
    ).length;

    const testsNotSubmitted = testsAllotted - testsSubmitted;

    // Get test submission details
    const submittedTests = testSubmissions
      .filter((sub) => sub.status === "SUBMITTED" || sub.status === "GRADED")
      .map((sub) => ({
        id: sub.id,
        testId: sub.testId,
        title: "Test",
        status: sub.status,
        obtainedMarks: sub.obtainedMarks,
        percentage: sub.percentage,
        submittedAt: sub.submittedAt,
      }));

    return res.status(200).json({
      status: true,
      message: "Student progress fetched successfully",
      data: {
        studentId,
        // Tests counts
        testsAllotted,
        testsSubmitted,
        testsNotSubmitted,
        // Assignment counts
        assignmentsAllotted,
        assignmentsSubmitted,
        assignmentsNotSubmitted,
        // Test submission details
        submittedTests,
        // Assignment submission details
        submittedAssignments,
      },
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

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        status: false,
        message: "studentId is required",
      });
    }

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // ✅ Soft delete (NO DB change)
    student.status = "TERMINATED";

    await student.save();

    return res.status(200).json({
      status: true,
      message:
        "Your Classplus account has been successfully deleted because of user request.",
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

export {
  getAllStudents,
  updateStudentStatus,
  getStudentById,
  updateStudentData,
  getStudentCount,
  getStudentLiveSessions,
  getStudentProgress,
  deleteStudent,
};
