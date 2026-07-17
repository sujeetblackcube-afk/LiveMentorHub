import Student from "../models/Student.js";
import Enrollment from "../models/Enrollment.js";
import Parent from "../models/Parent.js";
import pkg from 'sequelize';
const { Op } = pkg;
import Assignment from "../models/Assignment.js";
import SubscriptionBuyed from "../models/SubscriptionBuyed.js";
import Teacher from "../models/Teacher.js";
import Livesession from "../models/Livesession.js";
import { getStudentProgress } from "./studentController.js";


// Get all parents with their basic info (no student data yet - similar to getStudentReport)
export const getAllParentsReport = async (req, res) => {
  try {
    const { status } = req.query;

    // Build where clause for parents
    const parentWhere = {};
    if (status) {
      parentWhere.status = status;
    }

    // Get all parents with selected fields
    const parents = await Parent.findAll({
      attributes: [
        "userId",
        "parentId",
        "name",
        "email",
        "mobile",
        "profileImage",
        "address",
        "status",
        "createdAt",
      ],
      where: parentWhere,
      order: [["createdAt", "DESC"]],
    });

    // Get all student IDs grouped by parentId
    const students = await Student.findAll({
      attributes: ["studentId", "parentId"],
      where: {
        parentId: { [Op.ne]: null },
      },
    });

    // Create student count map by parentId
    const studentCountMap = {};
    students.forEach((student) => {
      if (student.parentId) {
        studentCountMap[student.parentId] = (studentCountMap[student.parentId] || 0) + 1;
      }
    });

    // Combine parent data with student count
    const reportData = parents.map((parent) => ({
      userId: parent.userId,
      parentId: parent.parentId,
      name: parent.name,
      email: parent.email,
      mobile: parent.mobile,
      profileImage: parent.profileImage,
      address: parent.address,
      status: parent.status,
      createdAt: parent.createdAt,
      studentCount: studentCountMap[parent.parentId] || 0,
    }));

    // Calculate summary
    const totalParents = reportData.length;
    const approvedParents = reportData.filter((p) => p.status === "APPROVED").length;
    const suspendedParents = reportData.filter((p) => p.status === "SUSPENDED").length;
    const terminatedParents = reportData.filter((p) => p.status === "TERMINATED").length;
    const totalStudents = Object.values(studentCountMap).reduce((sum, count) => sum + count, 0);

    return res.status(200).json({
      success: true,
      message: "All parents report fetched successfully",
      data: reportData,
      summary: {
        totalParents,
        approvedParents,
        suspendedParents,
        terminatedParents,
        totalStudents,
      },
    });
  } catch (error) {
    console.error("Get All Parents Report Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get parent report by parentId - fetch all students for that parent (detailed view)
export const getParentReportById = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Get parent details
    const parent = await Parent.findOne({
      attributes: [
        "userId",
        "parentId",
        "name",
        "email",
        "mobile",
        "profileImage",
        "address",
        "status",
        "createdAt",
      ],
      where: { parentId },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    // Get all students for this parent
    const students = await Student.findAll({
      attributes: [
        "userId",
        "name",
        "email",
        "mobile",
        "studentId",
        "profileImage",
        "parentName",
        "parentEmail",
        "parentMobile",
        "role",
        "address",
        "country",
        "status",
        "parentId",
        "createdAt",
      ],
      where: { parentId },
      order: [["createdAt", "DESC"]],
    });

    // Get all student IDs
    const studentIds = students.map((s) => s.studentId);

    // Get enrollments for all these students
    const enrollments = await Enrollment.findAll({
      where: {
        studentId: { [Op.in]: studentIds },
      },
      order: [["createdAt", "DESC"]],
    });

    // Create enrollment lookup map by studentId
    const enrollmentMap = {};
    enrollments.forEach((enrollment) => {
      if (!enrollmentMap[enrollment.studentId]) {
        enrollmentMap[enrollment.studentId] = [];
      }
      enrollmentMap[enrollment.studentId].push({
        enrollmentCode: enrollment.enrollmentCode,
        courseName: enrollment.courseName,
        courseCode: enrollment.courseCode,
        coursePrice: enrollment.coursePrice,
        enrollmentDate: enrollment.enrollmentDate,
        enrollmentExpireDate: enrollment.enrollmentExpireDate,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        transactionNumber: enrollment.transactionNumber,
        orderId: enrollment.orderId,
        paymentMethod: enrollment.paymentMethod,
        amountPaid: enrollment.amountPaid,
        currency: enrollment.currency,
        paymentDate: enrollment.paymentDate,
        teacherId: enrollment.teacherId,
        progress: enrollment.progress,
        createdAt: enrollment.createdAt,
      });
    });

    // Combine student data with enrollment data
    const studentData = students.map((student) => ({
      userId: student.userId,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      studentId: student.studentId,
      profileImage: student.profileImage,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentMobile: student.parentMobile,
      role: student.role,
      address: student.address,
      country: student.country,
      status: student.status,
      parentId: student.parentId,
      createdAt: student.createdAt,
      enrollments: enrollmentMap[student.studentId] || [],
    }));

    // Calculate summary
    const totalStudents = studentData.length;
    const totalEnrollments = enrollments.length;
    const paidEnrollments = enrollments.filter(
      (e) => e.paymentStatus === "PAID"
    ).length;
    const totalRevenue = enrollments
      .filter((e) => e.paymentStatus === "PAID")
      .reduce((sum, e) => sum + parseFloat(e.amountPaid || 0), 0);

    return res.status(200).json({
      success: true,
      message: "Parent report fetched successfully",
      data: {
        parent: {
          userId: parent.userId,
          parentId: parent.parentId,
          name: parent.name,
          email: parent.email,
          mobile: parent.mobile,
          profileImage: parent.profileImage,
          address: parent.address,
          status: parent.status,
          createdAt: parent.createdAt,
        },
        students: studentData,
        summary: {
          totalStudents,
          totalEnrollments,
          paidEnrollments,
          totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("Get Parent Report By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get all students with their enrollments for report
export const getStudentReport = async (req, res) => {
  try {
    const { startDate, endDate, status, courseCode } = req.query;

    // Build where clause for students
    const studentWhere = {};
    if (status) {
      studentWhere.status = status;
    }

    // Build where clause for enrollments
    const enrollmentWhere = {};
    if (startDate && endDate) {
      enrollmentWhere.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    if (courseCode) {
      enrollmentWhere.courseCode = courseCode;
    }

    // Get all students with selected fields (excluding sensitive data)
    const students = await Student.findAll({
      attributes: [
        "userId",
        "name",
        "email",
        "mobile",
        "studentId",
        "profileImage",
        "parentName",
        "parentEmail",
        "parentMobile",
        "role",
        "address",
        "country",
        "status",
        "parentId",
        "createdAt",
      ],
      where: studentWhere,
      order: [["createdAt", "DESC"]],
    });

    // Get all enrollments
    const enrollments = await Enrollment.findAll({
      where: enrollmentWhere,
      order: [["createdAt", "DESC"]],
    });

    // Create enrollment lookup map by studentId
    const enrollmentMap = {};
    enrollments.forEach((enrollment) => {
      if (!enrollmentMap[enrollment.studentId]) {
        enrollmentMap[enrollment.studentId] = [];
      }
      enrollmentMap[enrollment.studentId].push({
        enrollmentCode: enrollment.enrollmentCode,
        courseName: enrollment.courseName,
        courseCode: enrollment.courseCode,
        coursePrice: enrollment.coursePrice,
        enrollmentDate: enrollment.enrollmentDate,
        enrollmentExpireDate: enrollment.enrollmentExpireDate,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        transactionNumber: enrollment.transactionNumber,
        orderId: enrollment.orderId,
        paymentMethod: enrollment.paymentMethod,
        amountPaid: enrollment.amountPaid,
        currency: enrollment.currency,
        paymentDate: enrollment.paymentDate,
        teacherId: enrollment.teacherId,
        progress: enrollment.progress,
        createdAt: enrollment.createdAt,
      });
    });

    // Combine student data with enrollment data
    let reportData = students.map((student) => ({
      userId: student.userId,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      studentId: student.studentId,
      profileImage: student.profileImage,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentMobile: student.parentMobile,
      role: student.role,
      address: student.address,
      country: student.country,
      status: student.status,
      parentId: student.parentId,
      createdAt: student.createdAt,
      enrollments: enrollmentMap[student.studentId] || [],
    }));

    if (courseCode) {
      reportData = reportData.filter(student => student.enrollments.length > 0);
    }

    // Calculate summary
    const totalStudents = reportData.length;
    const totalEnrollments = enrollments.length;
    const paidEnrollments = enrollments.filter(
      (e) => e.paymentStatus === "PAID"
    ).length;
    const pendingEnrollments = enrollments.filter(
      (e) => e.paymentStatus === "UNPAID"
    ).length;
    const totalRevenue = enrollments
      .filter((e) => e.paymentStatus === "PAID")
      .reduce((sum, e) => sum + parseFloat(e.amountPaid || 0), 0);

    return res.status(200).json({
      success: true,
      message: "Student report fetched successfully",
      data: reportData,
      summary: {
        totalStudents,
        totalEnrollments,
        paidEnrollments,
        pendingEnrollments,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Get Student Report Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get student report by student ID
export const getStudentReportById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({
      attributes: [
        "userId",
        "name",
        "email",
        "mobile",
        "studentId",
        "profileImage",
        "parentName",
        "parentEmail",
        "parentMobile",
        "role",
        "address",
        "country",
        "status",
        "parentId",
        "createdAt",
      ],
      where: { studentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const enrollments = await Enrollment.findAll({
      where: { studentId },
      order: [["createdAt", "DESC"]],
    });

    const enrollmentData = enrollments.map((enrollment) => ({
      enrollmentCode: enrollment.enrollmentCode,
      courseName: enrollment.courseName,
      courseCode: enrollment.courseCode,
      coursePrice: enrollment.coursePrice,
      enrollmentDate: enrollment.enrollmentDate,
      enrollmentExpireDate: enrollment.enrollmentExpireDate,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      transactionNumber: enrollment.transactionNumber,
      orderId: enrollment.orderId,
      paymentMethod: enrollment.paymentMethod,
      amountPaid: enrollment.amountPaid,
      currency: enrollment.currency,
      paymentDate: enrollment.paymentDate,
      teacherId: enrollment.teacherId,
      progress: enrollment.progress,
      createdAt: enrollment.createdAt,
    }));

    const totalSpent = enrollments
      .filter((e) => e.paymentStatus === "PAID")
      .reduce((sum, e) => sum + parseFloat(e.amountPaid || 0), 0);

    // Call getStudentProgress function to get test and assignment progress
    const mockReq = { params: { studentId } };
    const mockRes = {
      status: () => mockRes,
      json: (data) => data
    };
    
    // Execute getStudentProgress and get the progress data
    const progressResult = await getStudentProgress(mockReq, mockRes);
    const progressData = progressResult.data || {};

    return res.status(200).json({
      success: true,
      message: "Student report fetched successfully",
      data: {
        userId: student.userId,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        studentId: student.studentId,
        profileImage: student.profileImage,
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentMobile: student.parentMobile,
        role: student.role,
        address: student.address,
        country: student.country,
        status: student.status,
        parentId: student.parentId,
        createdAt: student.createdAt,
        enrollments: enrollmentData,
        totalEnrollments: enrollments.length,
        totalSpent,
        // Include test and assignment progress data
        testsAllotted: progressData.testsAllotted || 0,
        testsSubmitted: progressData.testsSubmitted || 0,
        testsNotSubmitted: progressData.testsNotSubmitted || 0,
        assignmentsAllotted: progressData.assignmentsAllotted || 0,
        assignmentsSubmitted: progressData.assignmentsSubmitted || 0,
        assignmentsNotSubmitted: progressData.assignmentsNotSubmitted || 0,
        // Submission details
        submittedTests: progressData.submittedTests || [],
        submittedAssignments: progressData.submittedAssignments || [],
      },
    });
  } catch (error) {
    console.error("Get Student Report By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
// Get teacher by ID - returns teacher data along with live session count, assignment count, subscriptions, and enrollment count
export const getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Find teacher by teacherId
    const teacher = await Teacher.findByPk(teacherId, {
      attributes: { exclude: ['passwordHash', 'otp', 'otpExpiresAt', 'playerId', 'userId'] }
    });

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found"
      });
    }

    // Get count of live sessions created by this teacher
    const liveSessionCount = await Livesession.count({
      where: { teacherId }
    });

    // Get count of assignments created by this teacher
    const assignmentCount = await Assignment.count({
      where: { teacherId }
    });

    // Get all subscriptions bought by this teacher with payment details
    const subscriptions = await SubscriptionBuyed.findAll({
      where: { teacherId },
      order: [['createdAt', 'DESC']]
    });

    // Get count of students enrolled in this teacher's courses
    const enrollmentCount = await Enrollment.count({
      where: { teacherId, status: 'APPROVED' }
    });

    return res.status(200).json({
      status: true,
      message: "Teacher data fetched successfully",
      data: {
        teacher,
        liveSessionCount,
        assignmentCount,
        subscriptions,
        enrollmentCount
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
};
