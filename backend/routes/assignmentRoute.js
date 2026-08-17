/**
 * Legacy teacher assignment routes.
 * Kept for rollback safety while the teacher assignment module is moved under
 * backend/teacher/assignments.
 */

import express from 'express';
// import {
//   addAssignment,
//   getAssignments,
//   getAssignmentById,
//   editAssignment,
//   deleteAssignment,
//   submitAssignment,
//   uploadAssignmentFile,
//   getStudentAssignments,
//   getAssignmentOfStudentByTeacher,
//   checkAssignmentByTeacher,
// } from '../controllers/assignmentController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// router.use(authMiddleware);
// router.post('/:teacherId', uploadAssignmentFile, addAssignment);
// router.post('/students/submission', uploadAssignmentFile, submitAssignment);
// router.get('/', getAssignments);
// router.get('/:id', getAssignmentById);
// router.put('/:id', editAssignment);
// router.delete('/:id', deleteAssignment);
// router.get('/student/:studentId', getStudentAssignments);
// router.get('/teacher/:teacherId', getAssignmentOfStudentByTeacher);
// router.put('/teacher/submission/:submissionId', checkAssignmentByTeacher);

export default router;

