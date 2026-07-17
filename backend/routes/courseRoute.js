import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  getCourseCount,
  uploadThumbnail
} from "../controllers/courseController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Create a new course
router.post("/", uploadThumbnail.single('thumbnail'), createCourse);

// Get all courses
router.get("/", getAllCourses);

// Get course count
router.get("/count", getCourseCount);

// Get a single course by ID
router.get("/:courseCode", getCourseById);

// Update a course
router.put("/:courseCode", uploadThumbnail.single('thumbnail'), updateCourse);

// Delete a course
router.delete("/:courseCode", deleteCourse);

// Update course status
router.put("/:courseCode/status", updateCourseStatus);

export default router;
