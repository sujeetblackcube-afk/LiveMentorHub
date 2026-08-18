import express from "express";
import multer from "multer";
import { getProfile, updateProfile } from './superadmin.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import {
  getClassSummary,
  getClassHierarchyById,
} from "./classes/class.controller.js";
import {
  getSubjectCourses,
  getCourseParticipantsByCode,
  patchCourseDetails,
} from "./courses/course.controller.js";
import { createClass } from './classes/classLegacy.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// Profile
router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);

// Classes summary & hierarchy
router.get('/classes/summary', getClassSummary);
router.get('/classes/:classId/hierarchy', getClassHierarchyById);
router.post('/classes', createClass);

// Subject courses & participants
router.get('/subjects/:subjectCode/courses', getSubjectCourses);
router.get('/courses/:courseCode/participants', getCourseParticipantsByCode);
router.patch('/courses/:courseCode', patchCourseDetails);

export default router;
