/**
 * Admin Classes Controller
 * Handles HTTP requests for admin class management
 */

import {
  getClassStatsService,
  getClassHierarchyService,
} from './class.service.js';

/**
 * Get class statistics
 * GET /api/superadmin/classes
 */
export const getClassSummary = async (req, res) => {
  try {
    const data = await getClassStatsService();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch class statistics',
    });
  }
};

/**
 * Get class hierarchy by ID
 * GET /api/superadmin/classes/:id/hierarchy
 */
export const getClassHierarchyById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getClassHierarchyService(id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch class hierarchy',
    });
  }
};
