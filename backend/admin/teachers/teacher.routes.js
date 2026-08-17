/**
 * Admin Teacher Routes
 * Defines all admin teacher management API endpoints
 */

import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  getAllTeachers,
  updateTeacherStatus,
  getTeacherCount,
  updateCoursename,
  deleteTeacher,
} from './teacher.controller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/admin/teachers/count
 * Get total count of teachers
 */
router.get('/count', getTeacherCount);

/**
 * GET /api/admin/teachers
 * Get all teachers with pagination and filters
 * Query params: page, limit, search, status, startDate, endDate
 */
router.get('/', getAllTeachers);

/**
 * PATCH /api/admin/teachers/:teacherId/status
 * Update teacher status (PENDING, APPROVED, SUSPENDED, TERMINATED)
 */
router.patch('/:teacherId/status', updateTeacherStatus);

/**
 * PATCH /api/admin/teachers/:teacherId/courses
 * Allocate courses to teacher
 */
router.patch('/:teacherId/courses', updateCoursename);

/**
 * DELETE /api/admin/teachers/:teacherId
 * Delete teacher (soft delete - marks as TERMINATED)
 */
router.delete('/:teacherId', deleteTeacher);

export default router;
