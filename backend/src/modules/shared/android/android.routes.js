import express from "express";
import { getHomeData } from '../../../androidcontrollers/homecontrollers.js';
import { getCoursePageData, getCoursesBySubject, getNotesByStudent } from '../../../androidcontrollers/coursepagedataController.js';
import { getTeacherStudentData, getTeacherHomepage } from '../../../androidcontrollers/teacherstudentdatacontroller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

// ========== Home Data (Public / Demo / Guest accessible) ==========
router.get("/home/:studentId", getHomeData);

// ========== Course Page Data (Public / Catalog Browsing) ==========
router.get("/coursepagedata/:studentId/subject/:subjectCode", getCoursesBySubject);
router.get("/coursepagedata/:studentId", getCoursePageData);

router.use(authMiddleware);

// Get notes for a student in a specific course (Protected enrollment content)
router.get("/coursepagedata/:studentId/:courseCode/content", getNotesByStudent);

// ========== Teacher Student Data & Homescreen ==========
router.get("/teacherstudentdata/teacherhomepage", getTeacherHomepage);
router.get("/teacherstudentdata/teacherhomepage/:teacherId", getTeacherHomepage);
router.get("/teacherstudentdata/:teacherId", getTeacherStudentData);
router.get("/teacher/homescreenData", getTeacherHomepage);
router.get("/teacher/homescreenData/:teacherId", getTeacherHomepage);
router.get("/homescreenData/:teacherId", getTeacherHomepage);

export default router;
