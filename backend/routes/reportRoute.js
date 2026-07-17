import express from "express";
import { getStudentReport, getStudentReportById, getParentReportById, getAllParentsReport,getTeacherById } from "../controllers/reportController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all parents with their student count (summary view)
router.get("/parents", getAllParentsReport);

// Get parent report by parentId - fetch all students for that parent (detailed view)
router.get("/parents/:parentId", getParentReportById);

// Get all students with their enrollments for report
router.get("/students", getStudentReport);

// Get student report by student ID
router.get("/students/:studentId", getStudentReportById);

// Get teacher by ID - returns teacher data with live session count, assignment count, subscriptions, and enrollment count
router.get('/:teacherId', getTeacherById);

export default router;
