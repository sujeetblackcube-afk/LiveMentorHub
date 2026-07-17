import express from "express";
import authMiddleware from "../middleware/authmiddleware.js";
import { getTeacherStudentData, getAllTeacherStudents, getTeacherHomepage } from "../androidcontrollers/teacherstudentdatacontroller.js";

const router = express.Router();

// Get teacher student data (students, assignments, notes per course)
router.get("/", authMiddleware, getTeacherStudentData);
router.get('/students', authMiddleware, getAllTeacherStudents);

router.get('/teacherhomepage', authMiddleware, getTeacherHomepage);

export default router;
