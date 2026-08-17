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

const requireTeacherRole = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required',
    });
  }

  next();
};

router.use(authMiddleware);
router.use(requireTeacherRole);

router.get('/', getTeacherCourses);
router.get('/:courseCode/students', getTeacherCourseStudents);

export default router;
