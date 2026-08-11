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
import { getCourseReviews } from "../controllers/reviewController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Public routes
router.get("/", getAllCourses);
router.get("/count", getCourseCount);
router.get("/:courseCode/reviews", getCourseReviews);
router.get("/:courseCode", getCourseById);

router.use(authMiddleware);

// Create a new course
router.post("/", uploadThumbnail.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'introVideo', maxCount: 1 }]), createCourse);

// Update a course
router.put("/:courseCode", uploadThumbnail.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'introVideo', maxCount: 1 }]), updateCourse);

// Delete a course
router.delete("/:courseCode", deleteCourse);

// Update course status
router.put("/:courseCode/status", updateCourseStatus);

export default router;
