import express from "express";
import {
  createTest,
  getAllTests,
  getTestById,
  getAllTestsByCourseCode,
  updateTest,
  deleteTest,
  fetchAllTestsForStudent,
  submitTestByStudent,
  getTeacherTestSubmissions,
  updateTestSubmissionMarks

} from "../controllers/testController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new test
router.post("/", createTest);

// Get all tests (with optional filters)
router.get("/", getAllTests);

// Get test by ID
router.get("/:id", getTestById);

// Get all tests by courseCode
router.get("/course/:courseCode", getAllTestsByCourseCode);

// Update a test
router.put("/:id", updateTest);

// Delete a test
router.delete("/:id", deleteTest);

// Fetch all tests for a student
router.get("/student/:studentId", fetchAllTestsForStudent);

// Submit test by student
router.post("/submit", submitTestByStudent);


// get test submissions for a specific teacher
router.get('/:teacherId/test-submissions', getTeacherTestSubmissions);

// update marks and feedback for a specific test submission
router.put('/grade-submission/:submissionId', updateTestSubmissionMarks);

export default router;
