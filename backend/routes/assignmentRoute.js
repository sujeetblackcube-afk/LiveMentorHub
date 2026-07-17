import express from "express";
import {
  addAssignment,
  getAssignments,
  getAssignmentById,
  editAssignment,
  deleteAssignment,
  submitAssignment,
  uploadAssignmentFile,
  getStudentAssignments,
  getAssignmentOfStudentByTeacher,
  checkAssignmentByTeacher
} from "../controllers/assignmentController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Add a new assignment with file upload
router.post("/:teacherId", uploadAssignmentFile, addAssignment);

// Submit an assignment
router.post("/students/submission", uploadAssignmentFile, submitAssignment);

// Get assignments by courseCode and teacherId
router.get("/", getAssignments);

// Get assignment by ID
router.get("/:id", getAssignmentById);

// Edit an assignment
router.put("/:id", editAssignment);

// Delete an assignment
router.delete("/:id", deleteAssignment);

// Get student assignments
router.get("/student/:studentId", getStudentAssignments);

// Get assignments of students by teacherId
router.get("/teacher/:teacherId", getAssignmentOfStudentByTeacher);

// update marks and feedback for a submission
router.put("/teacher/submission/:submissionId", checkAssignmentByTeacher);

export default router;

