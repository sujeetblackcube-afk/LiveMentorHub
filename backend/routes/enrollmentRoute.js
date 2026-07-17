import express from "express";
import {
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getAllEnrolledStudents,
  getEnrolledStudentById,
  getEnrollmentCount,
  getEnrollmentCountByCourse,
  getEnrollmentCountThisMonth,
  getEnrollmentCountThisWeek,
  getEnrollmentDataThisWeek,
  getEnrollmentDataThisMonth,
  getSalesDataThisWeek,
  getSalesDataThisMonth,
  getTotalSalesThisMonth,
  getTotalSalesThisWeek,
  updateTeacherIdInEnrollments,
  getEnrollmentCountByTeacherId,
  getEnrollmentsByTeacherId,
  getEnrollmentsByCourseCode,
  createCashfreeOrder,
  getEnrollmentsByStudentId
} from "../controllers/enrollmentController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Stripe webhook route - moved to server.js to be before global body parsers
// The webhook is now handled at /api/enrollments/webhook in server.js

// Cashfree Create Order Route
router.post("/create-cashfree-order", authMiddleware, createCashfreeOrder);

// Apply auth middleware to all other routes
router.use(authMiddleware);

// Create a new enrollment
router.post("/", createEnrollment);

// Get all enrollments
router.get("/", getAllEnrolledStudents);

// Get enrollment count
router.get("/count", getEnrollmentCount);

// Get enrollment count this month
router.get("/count/month", getEnrollmentCountThisMonth);

// Get enrollment count this week
router.get("/count/week", getEnrollmentCountThisWeek);

// Get enrollment count by course
router.get("/count/course/:courseCode", getEnrollmentCountByCourse);

// Get enrollment data this week
router.get("/data/week", getEnrollmentDataThisWeek);

// Get enrollment data this month
router.get("/data/month", getEnrollmentDataThisMonth);

// Get sales data this week
router.get("/sales/week", getSalesDataThisWeek);

// Get sales data this month
router.get("/sales/month", getSalesDataThisMonth);

// Get total sales this month
router.get("/sales/total/month", getTotalSalesThisMonth);

// Get total sales this week
router.get("/sales/total/week", getTotalSalesThisWeek);

// Get enrollments by course code (for student dropdown in assign teacher)
router.get("/course/:courseCode", getEnrollmentsByCourseCode);

// Update teacherId in enrollments (accepts teacherId, studentIds, courseCode in body)
router.put("/update-teacher", updateTeacherIdInEnrollments);

// Get a single enrollment by ID
router.get("/:enrollmentCode", getEnrolledStudentById);

// Update an enrollment
router.put("/:enrollmentCode", updateEnrollment);

// Delete an enrollment
router.delete("/:enrollmentCode", deleteEnrollment);

// Get enrollment count by teacherId
router.get("/count/teacher/:teacherId", getEnrollmentCountByTeacherId);

// Get enrollments by teacherId
router.get("/teacher/:teacherId", getEnrollmentsByTeacherId);

// Get enrollments by studentId
router.get("/student/:studentId", getEnrollmentsByStudentId);

export default router;
