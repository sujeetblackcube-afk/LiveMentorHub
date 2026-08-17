/**
 * Legacy enrollment routes.
 * Kept for rollback safety while the student enrollment module is moved under
 * backend/student/enrollments.
 */

import express from 'express';
// import {
//   createEnrollment,
//   updateEnrollment,
//   deleteEnrollment,
//   getAllEnrolledStudents,
//   getEnrolledStudentById,
//   getEnrollmentCount,
//   getEnrollmentCountByCourse,
//   getEnrollmentCountThisMonth,
//   getEnrollmentCountThisWeek,
//   getEnrollmentDataThisWeek,
//   getEnrollmentDataThisMonth,
//   getSalesDataThisWeek,
//   getSalesDataThisMonth,
//   getTotalSalesThisMonth,
//   getTotalSalesThisWeek,
//   updateTeacherIdInEnrollments,
//   getEnrollmentCountByTeacherId,
//   getEnrollmentsByTeacherId,
//   getEnrollmentsByCourseCode,
//   createCashfreeOrder,
//   getEnrollmentsByStudentId,
// } from '../controllers/enrollmentController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// // Cashfree Create Order Route
// router.post('/create-cashfree-order', authMiddleware, createCashfreeOrder);
// router.use(authMiddleware);
// router.post('/', createEnrollment);
// router.get('/', getAllEnrolledStudents);
// router.get('/count', getEnrollmentCount);
// router.get('/count/month', getEnrollmentCountThisMonth);
// router.get('/count/week', getEnrollmentCountThisWeek);
// router.get('/count/course/:courseCode', getEnrollmentCountByCourse);
// router.get('/data/week', getEnrollmentDataThisWeek);
// router.get('/data/month', getEnrollmentDataThisMonth);
// router.get('/sales/week', getSalesDataThisWeek);
// router.get('/sales/month', getSalesDataThisMonth);
// router.get('/sales/total/month', getTotalSalesThisMonth);
// router.get('/sales/total/week', getTotalSalesThisWeek);
// router.get('/course/:courseCode', getEnrollmentsByCourseCode);
// router.put('/update-teacher', updateTeacherIdInEnrollments);
// router.get('/:enrollmentCode', getEnrolledStudentById);
// router.put('/:enrollmentCode', updateEnrollment);
// router.delete('/:enrollmentCode', deleteEnrollment);
// router.get('/count/teacher/:teacherId', getEnrollmentCountByTeacherId);
// router.get('/teacher/:teacherId', getEnrollmentsByTeacherId);
// router.get('/student/:studentId', getEnrollmentsByStudentId);

export default router;

