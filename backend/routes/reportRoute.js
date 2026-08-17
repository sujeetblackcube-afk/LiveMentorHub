/**
 * Legacy report routes.
 * Kept for rollback safety while teacher/admin report flows are moved under
 * backend/admin/reports and the teacher module.
 */

import express from 'express';
// import { getStudentReport, getStudentReportById, getParentReportById, getAllParentsReport, getTeacherById } from '../controllers/reportController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// router.use(authMiddleware);
// router.get('/parents', getAllParentsReport);
// router.get('/parents/:parentId', getParentReportById);
// router.get('/students', getStudentReport);
// router.get('/students/:studentId', getStudentReportById);
// router.get('/:teacherId', getTeacherById);

export default router;
