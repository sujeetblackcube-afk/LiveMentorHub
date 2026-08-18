/**
 * Admin Course Routes
 * Routes for admin course management
 * Mounted at: /api/superadmin
 */

import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  getSubjectCourses,
  getCourseParticipantsByCode,
  patchCourseDetails,
} from './course.controller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/superadmin/subjects/:subjectCode/courses
 * Get all courses for a specific subject
 */
router.get('/subjects/:subjectCode/courses', getSubjectCourses);

/**
 * GET /api/superadmin/courses/:courseCode/participants
 * Get teachers and students enrolled in a course
 */
router.get('/courses/:courseCode/participants', getCourseParticipantsByCode);

/**
 * PATCH /api/superadmin/courses/:courseCode
 * Update course details
 */
router.patch('/courses/:courseCode', patchCourseDetails);

export default router;
