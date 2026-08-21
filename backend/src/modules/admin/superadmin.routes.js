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
import { createClass, getAllClasses } from './classes/class.controller.js';
import { sendBroadcast } from './notifications/broadcast.controller.js';

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
router.get('/classes', getAllClasses);

// Subject courses & participants
router.get('/subjects/:subjectCode/courses', getSubjectCourses);
router.get('/courses/:courseCode/participants', getCourseParticipantsByCode);
router.patch('/courses/:courseCode', patchCourseDetails);

// Broadcast endpoints
router.post('/broadcast', sendBroadcast);
router.post('/send-broadcast', sendBroadcast);

export default router;
