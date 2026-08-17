import express from "express";
import multer from "multer";
import { getProfile, updateProfile } from "../controllers/superAdminController.js";
import { adminGetAllReviews, adminDeleteReview} from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authmiddleware.js";
import {
  getClassSummary,
  getClassHierarchyById,
} from "../admin/classes/class.controller.js";
import {
  getSubjectCourses,
  getCourseParticipantsByCode,
  patchCourseDetails,
} from "../admin/courses/course.controller.js";
import { createClass } from '../controllers/classController.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile);

router.get('/reviews', authMiddleware, adminGetAllReviews);
router.delete('/reviews/:reviewId', authMiddleware, adminDeleteReview);

router.post('/classes', authMiddleware, createClass);
router.get('/classes', authMiddleware, getClassSummary);
router.get('/classes/:id/hierarchy', authMiddleware, getClassHierarchyById);
router.get('/subjects/:subjectCode/courses', authMiddleware, getSubjectCourses);
router.get('/courses/:courseCode/participants', authMiddleware, getCourseParticipantsByCode);
router.patch('/courses/:courseCode', authMiddleware, patchCourseDetails);

export default router;
