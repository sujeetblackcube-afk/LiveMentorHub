/**
 * Admin Student Routes
 * Defines all admin student management API endpoints
 */

import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  getAllStudents,
  getStudentById,
  updateStudentStatus,
  getStudentCount,
  deleteStudent,
} from './student.controller.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(requireSuperAdmin);

/**
 * GET /api/admin/students/count
 * Get total count of students (with optional status filter)
 */
router.get('/count', getStudentCount);

/**
 * GET /api/admin/students
 * Get all students with pagination and filters
 * Query params: page, limit, search, status, startDate, endDate
 */
router.get('/', getAllStudents);

/**
 * GET /api/admin/students/:studentId
 * Get specific student details
 */
router.get('/:studentId', getStudentById);

/**
 * PATCH /api/admin/students/:studentId/status
 * Update student status (APPROVED, SUSPENDED, TERMINATED)
 */
router.patch('/:studentId/status', updateStudentStatus);

/**
 * DELETE /api/admin/students/:studentId
 * Delete student (soft delete - marks as TERMINATED)
 */
router.delete('/:studentId', deleteStudent);

export default router;
