/**
 * Admin Classes Routes
 * Routes for admin class management
 * Mounted at: /api/superadmin/classes
 */

import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  getClassSummary,
  getClassHierarchyById,
} from './class.controller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/superadmin/classes
 * Get statistics for all classes
 */
router.get('/', getClassSummary);

/**
 * GET /api/superadmin/classes/:id/hierarchy
 * Get hierarchy (subjects and courses) for a specific class
 */
router.get('/:id/hierarchy', getClassHierarchyById);

export default router;
