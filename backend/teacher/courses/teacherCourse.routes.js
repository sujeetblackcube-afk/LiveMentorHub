/**
 * Teacher course routes.
 * Internal refactor route. Public route remains /api/teachers/courses.
 */

import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  getTeacherCourses,
  getTeacherCourseStudents,
} from './teacherCourse.controller.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getTeacherCourses);
router.get('/:courseCode/students', getTeacherCourseStudents);

export default router;
