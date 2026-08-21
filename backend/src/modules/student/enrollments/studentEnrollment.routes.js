/**
 * Student Enrollment Routes
 * Routes for student course enrollment and purchase
 */

import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
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
  verifyEnrollmentCashfreeOrder,
  getEnrollmentsByStudentId,
  cashfreeWebhook,
} from '../../../modules/student/enrollments/studentEnrollment.controller.js';

const router = express.Router();

// Public Webhook Route (from Cashfree server)
router.post('/cashfree-webhook', cashfreeWebhook);
router.post('/webhook', cashfreeWebhook);

// Cashfree Order Routes
router.post('/create-cashfree-order', authMiddleware, createCashfreeOrder);
router.all('/verify-cashfree-order/:orderId', verifyEnrollmentCashfreeOrder);

// Apply auth middleware to all other routes
router.use(authMiddleware);

// Create a new enrollment
router.post('/', createEnrollment);

// Get all enrollments
router.get('/', getAllEnrolledStudents);

// Get enrollment count
router.get('/count', getEnrollmentCount);

// Get enrollment count this month
router.get('/count/month', getEnrollmentCountThisMonth);

// Get enrollment count this week
router.get('/count/week', getEnrollmentCountThisWeek);

// Get enrollment count by course
router.get('/count/course/:courseCode', getEnrollmentCountByCourse);

// Get enrollment data this week
router.get('/data/week', getEnrollmentDataThisWeek);

// Get enrollment data this month
router.get('/data/month', getEnrollmentDataThisMonth);

// Get sales data this week
router.get('/sales/week', getSalesDataThisWeek);

// Get sales data this month
router.get('/sales/month', getSalesDataThisMonth);

// Get total sales this month
router.get('/sales/total/month', getTotalSalesThisMonth);

// Get total sales this week
router.get('/sales/total/week', getTotalSalesThisWeek);

// Get enrollments by course code (for student dropdown in assign teacher)
router.get('/course/:courseCode', getEnrollmentsByCourseCode);

// Update teacherId in enrollments (accepts teacherId, studentIds, courseCode in body)
router.put('/update-teacher', updateTeacherIdInEnrollments);

// Get a single enrollment by ID
router.get('/:enrollmentCode', getEnrolledStudentById);

// Update an enrollment
router.put('/:enrollmentCode', updateEnrollment);

// Delete an enrollment
router.delete('/:enrollmentCode', deleteEnrollment);

// Get enrollment count by teacherId
router.get('/count/teacher/:teacherId', getEnrollmentCountByTeacherId);

// Get enrollments by teacherId
router.get('/teacher/:teacherId', getEnrollmentsByTeacherId);

// Get enrollments by studentId
router.get('/student/:studentId', getEnrollmentsByStudentId);

export default router;
