import express from "express";
import { getCoursePageData, getCoursesBySubject, getNotesByStudent } from "../androidcontrollers/coursepagedataController.js";
import authMiddleware from "../middleware/authmiddleware.js";
const router = express.Router();

// Get courses by subject with enrollment status
router.get("/:studentId/subject/:subjectCode", getCoursesBySubject);

// Get course page data for a student
router.get("/:studentId", getCoursePageData);

// Get notes for a student in a specific course
router.get("/:studentId/:courseCode/content", authMiddleware, getNotesByStudent);

export default router;
