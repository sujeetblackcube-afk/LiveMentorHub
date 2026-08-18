/**
 * Admin Teacher Controller
 * Handles HTTP requests for admin teacher management
 */

import {
  getAllTeachersService,
  updateTeacherStatusService,
  getTeacherCountService,
  updateCoursenameService,
  deleteTeacherService,
} from './teacher.service.js';

/**
 * Get all teachers
 * GET /api/admin/teachers
 * Query params: status, page, limit, search, startDate, endDate
 */
export const getAllTeachers = async (req, res) => {
  try {
    const { status, page, limit, search, startDate, endDate } = req.query;

    const filters = {
      status,
      search,
      startDate,
      endDate,
    };

    const result = await getAllTeachersService(filters, page, limit);

    // Check if paginated result
    if (result.data) {
      return res.status(200).json({
        status: true,
        message: 'Teachers fetched successfully',
        data: result.data,
        pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          limit: result.limit,
        },
      });
    }

    // Return all teachers (non-paginated)
    return res.status(200).json({
      status: true,
      message: 'Teachers fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * Update teacher status
 * PATCH /api/admin/teachers/:teacherId/status
 */
export const updateTeacherStatus = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: 'Status is required',
      });
    }

    const teacher = await updateTeacherStatusService(teacherId, status);

    return res.status(200).json({
      status: true,
      message: 'Teacher status updated successfully',
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Get teacher count
 * GET /api/admin/teachers/count
 */
export const getTeacherCount = async (req, res) => {
  try {
    const count = await getTeacherCountService();

    return res.status(200).json({
      status: true,
      message: 'Teacher count fetched successfully',
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * Update teacher course allocation
 * PATCH /api/admin/teachers/:teacherId/courses
 */
export const updateCoursename = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { coursename } = req.body;

    const teacher = await updateCoursenameService(teacherId, coursename);

    return res.status(200).json({
      status: true,
      message: 'Teacher course information updated successfully',
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Delete teacher (soft delete)
 * DELETE /api/admin/teachers/:teacherId
 */
export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: 'teacherId is required',
      });
    }

    const teacher = await deleteTeacherService(teacherId);

    return res.status(200).json({
      status: true,
      message: 'Teacher deleted successfully',
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message || 'Server error',
    });
  }
};
