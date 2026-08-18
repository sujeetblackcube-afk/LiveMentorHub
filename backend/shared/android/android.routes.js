import express from "express";
import { getHomeData } from "../../androidcontrollers/homecontrollers.js";
import { getCoursePageData, getCoursesBySubject, getNotesByStudent } from "../../androidcontrollers/coursepagedataController.js";
import { getTeacherStudentData } from "../../androidcontrollers/teacherstudentdatacontroller.js";
import authMiddleware from "../../middleware/authmiddleware.js";

const router = express.Router();

// ========== Home Data (Public / Demo / Guest accessible) ==========
router.get("/home/:studentId", getHomeData);

// ========== Course Page Data (Public / Catalog Browsing) ==========
router.get("/coursepagedata/:studentId/subject/:subjectCode", getCoursesBySubject);
router.get("/coursepagedata/:studentId", getCoursePageData);

router.use(authMiddleware);

// Get notes for a student in a specific course (Protected enrollment content)
router.get("/coursepagedata/:studentId/:courseCode/content", getNotesByStudent);

// ========== Teacher Student Data ==========
// Get teacher student data
router.get("/teacherstudentdata/:teacherId", getTeacherStudentData);

export default router;
