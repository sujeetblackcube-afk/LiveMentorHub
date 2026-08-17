/**
 * Legacy test routes.
 * Kept for rollback safety while the student test submission module is moved under
 * backend/student/tests.
 */

import express from "express";
// import {
//   createTest,
//   getAllTests,
//   getTestById,
//   getAllTestsByCourseCode,
//   updateTest,
//   deleteTest,
//   fetchAllTestsForStudent,
//   submitTestByStudent,
//   getTeacherTestSubmissions,
//   updateTestSubmissionMarks
// } from '../controllers/testController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// // Apply auth middleware to all routes
// router.use(authMiddleware);
// router.post('/', createTest);
// router.get('/', getAllTests);
// router.get('/:id', getTestById);
// router.get('/course/:courseCode', getAllTestsByCourseCode);
// router.put('/:id', updateTest);
// router.delete('/:id', deleteTest);
// router.get('/student/:studentId', fetchAllTestsForStudent);
// router.post('/submit', submitTestByStudent);
// router.get('/:teacherId/test-submissions', getTeacherTestSubmissions);
// router.put('/grade-submission/:submissionId', updateTestSubmissionMarks);

export default router;

