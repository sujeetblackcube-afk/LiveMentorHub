import Parent from "../models/Parent.js";
import Student from "../models/Student.js";
import pkg from 'sequelize';
const { Op } = pkg;
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import Enrollment from "../models/Enrollment.js";
import Doubt from "../models/Doubt.js";
import TestSubmission from "../models/TestSubmission.js";
import Livesession from "../models/Livesession.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getPaginatedData } from "../utils/pagination.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/profiles/"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

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

// Get all parents (with optional pagination and name search)
const getAllParents = async (req, res) => {
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

    // filter by date range (createdAt)
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [
          new Date(`${startDate} 00:00:00`),
          new Date(`${endDate} 23:59:59`),
        ],
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(`${startDate} 00:00:00`),
      };
    } else if (endDate) {
      whereClause.createdAt = {
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
      order: [["createdAt", "DESC"]],
    };

    let parents;
    let paginationMeta = null;

    if (page) {
      const paginatedResult = await getPaginatedData(
        Parent,
        queryOptions,
        page,
        limit || 10
      );
      parents = paginatedResult.data;
      paginationMeta = {
        totalItems: paginatedResult.totalItems,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage,
        limit: paginatedResult.limit,
      };
    } else {
      parents = await Parent.findAll(queryOptions);
    }

    // For each parent, fetch all associated students
    const parentsWithStudents = await Promise.all(
      parents.map(async (parent) => {
        const parentJson = typeof parent.toJSON === "function" ? parent.toJSON() : parent;
        const students = await Student.findAll({
          where: { parentId: parentJson.parentId },
          attributes: ["name", "studentId", "profileImage"],
        });

        return {
          ...parentJson,
          students: students.map((student) => ({
            name: student.name,
            studentId: student.studentId,
            profileImage: student.profileImage,
          })),
        };
      }),
    );

    const response = {
      status: true,
      message: "Parents fetched successfully",
      data: parentsWithStudents,
    };

    if (paginationMeta) {
      response.pagination = paginationMeta;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateParentStatus = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["APPROVED", "SUSPENDED", "TERMINATED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value",
      });
    }

    const parent = await Parent.findByPk(parentId);

    if (!parent) {
      return res.status(404).json({
        status: false,
        message: "Parent not found",
      });
    }

    parent.status = status;
    await parent.save();

    return res.status(200).json({
      status: true,
      message: "Parent status updated successfully",
      data: parent,
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

const getParentCount = async (req, res) => {
  try {
    const count = await Parent.count();
    return res.status(200).json({
      status: true,
      message: "Parent count fetched successfully",
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

const getStudentsByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { studentId: queryStudentId } = req.query; // 👈 from query

    // =============================
    // Build where condition
    // =============================
    const whereCondition = {
      parentId,
    };

    // If studentId passed in query, filter that student only
    if (queryStudentId) {
      whereCondition.studentId = queryStudentId;
    }

    const students = await Student.findAll({
      where: whereCondition,
      attributes: [
        "name",
        "email",
        "mobile",
        "studentId",
        "status",
        "profileImage",
      ],
    });

    if (!students.length) {
      return res.status(404).json({
        status: false,
        message: queryStudentId
          ? "Student not found for this parent"
          : "No students found",
      });
    }

    const currentTime = new Date();

    // 🔥 Auto update live session status
    await Livesession.update(
      { status: "ongoing" },
      {
        where: {
          status: "upcoming",
          startTime: { [Op.lte]: currentTime },
        },
      },
    );

    await Livesession.update(
      { status: "completed" },
      {
        where: {
          status: "ongoing",
          endTime: { [Op.lt]: currentTime },
        },
      },
    );

    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const studentId = student.studentId;

        // =============================
        // Enrollments (APPROVED only)
        // =============================
        const enrollments = await Enrollment.findAll({
          where: {
            studentId,
            status: "APPROVED",
          },
        });

        const courseCodes = enrollments.map((e) => e.courseCode);

        // =============================
        // Live Sessions (Upcoming + Ongoing)
        // =============================
        const liveSessions =
          courseCodes.length > 0
            ? await Livesession.findAll({
                where: {
                  courseCode: { [Op.in]: courseCodes },
                  status: { [Op.in]: ["upcoming", "ongoing"] },
                },
                order: [["startTime", "ASC"]],
              })
            : [];

        // =============================
        // Assignment Submissions
        // =============================
        const assignments = await AssignmentSubmission.findAll({
          where: { studentId },
        });

        // =============================
        // Doubts
        // =============================
        const doubts = await Doubt.findAll({
          where: { studentId },
        });

        // =============================
        // Test Submissions
        // =============================
        const tests = await TestSubmission.findAll({
          where: { studentId },
        });

        // =============================
        // Calculate Progress
        // =============================
        let assignmentPercentage = 0;
        let totalAssignments = assignments.length;

        if (totalAssignments > 0) {
          assignmentPercentage =
            assignments.reduce((sum, a) => sum + (a.percentage || 0), 0) /
            totalAssignments;
        }

        let testPercentage = 0;
        let totalTests = tests.length;

        if (totalTests > 0) {
          testPercentage =
            tests.reduce((sum, t) => sum + (t.percentage || 0), 0) / totalTests;
        }

        const totalSubmissions = totalAssignments + totalTests;

        let progress = 0;

        if (totalSubmissions > 0) {
          const totalPercentageSum =
            assignmentPercentage * totalAssignments +
            testPercentage * totalTests;

          progress = totalPercentageSum / totalSubmissions;
        }
        return {
          name: student.name,
          email: student.email,
          mobileNumber: student.mobile,
          studentId: student.studentId,
          status: student.status,
          profileImage: student.profileImage,
          enrollments,
          liveSessions,
          assignments,
          doubts,
          tests,
          progress,
        };
      }),
    );

    return res.status(200).json({
      status: true,
      message: queryStudentId
        ? "Student dashboard data fetched successfully"
        : "Students full dashboard data fetched successfully",
      children: studentsWithDetails,
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

const getParentById = async (req, res) => {
  try {
    const { parentId } = req.params;

    const parent = await Parent.findByPk(parentId, {
      attributes: {
        exclude: [
          "passwordHash",
          "otp",
          "otpVerified",
          "otpExpiresAt",
          "createdAt",
          "updatedAt",
          "playerId",
          "userId",
        ],
      },
    });

    if (!parent) {
      return res.status(404).json({
        status: false,
        message: "Parent not found",
      });
    }

    // Fetch associated students
    const students = await Student.findAll({
      where: { parentId: parent.parentId },
      attributes: ["name", "studentId", "profileImage"],
    });

    const parentWithStudents = {
      ...parent.toJSON(),
      students: students.map((student) => ({
        name: student.name,
        studentId: student.studentId,
        profileImage: student.profileImage,
      })),
    };

    return res.status(200).json({
      status: true,
      message: "Parent fetched successfully",
      data: parentWithStudents,
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

const updateParentData = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { name, address, country, lattitude, longitude } = req.body || {};

    const parent = await Parent.findByPk(parentId);

    if (!parent) {
      return res.status(404).json({
        status: false,
        message: "Parent not found",
      });
    }

    // Validate required fields
    if (name !== undefined && (!name || name.trim() === "")) {
      return res.status(400).json({
        status: false,
        message: "Name cannot be empty",
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

    if (name !== undefined) parent.name = name.trim();
    if (address !== undefined) parent.address = address.trim();
    if (country !== undefined) parent.country = country.trim();

    if (lattitude !== undefined) parent.lattitude = lattitude;
    if (longitude !== undefined) parent.longitude = longitude;

    // Handle profile image upload
    if (req.file) {
      parent.profileImage = "/uploads/profiles/" + req.file.filename;
    }

    await parent.save();

    // Convert to plain object
    const parentData = parent.toJSON();

    // Remove sensitive fields
    delete parentData.passwordHash;
    delete parentData.otp;
    delete parentData.otpExpiresAt;

    return res.status(200).json({
      status: true,
      message: "Parent data updated successfully",
      data: parentData,
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

const deleteParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({
        status: false,
        message: "parentId is required",
      });
    }

    const parent = await Parent.findByPk(parentId);

    if (!parent) {
      return res.status(404).json({
        status: false,
        message: "Parent not found",
      });
    }

    // ✅ Soft delete - set TERMINATED status
    parent.status = "TERMINATED";

    await parent.save();

    return res.status(200).json({
      status: true,
      message: "Your Classplus account has been successfully deleted because of user request.",
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
  getAllParents,
  updateParentStatus,
  getParentCount,
  getStudentsByParentId,
  updateParentData,
  getParentById,
  deleteParent
};
