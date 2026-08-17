import express from "express";
import { getHomeData } from "../../androidcontrollers/homecontrollers.js";
import { getCoursePageData, getCoursesBySubject, getNotesByStudent } from "../../androidcontrollers/coursepagedataController.js";
import { getTeacherStudentData } from "../../androidcontrollers/teacherstudentdatacontroller.js";
import authMiddleware from "../../middleware/authmiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// ========== Home Data ==========
router.get("/home/:studentId", getHomeData);

// ========== Course Page Data ==========
// Get courses by subject with enrollment status
router.get("/coursepagedata/:studentId/subject/:subjectCode", getCoursesBySubject);

// Get course page data for a student
router.get("/coursepagedata/:studentId", getCoursePageData);

// Get notes for a student in a specific course
router.get("/coursepagedata/:studentId/:courseCode/content", getNotesByStudent);

// ========== Teacher Student Data ==========
// Get teacher student data
router.get("/teacherstudentdata/:teacherId", getTeacherStudentData);

export default router;
