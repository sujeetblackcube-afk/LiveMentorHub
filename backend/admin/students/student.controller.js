/**
 * Admin Student Controller
 * Handles HTTP requests for admin student management
 */

import {
  getAllStudentsService,
  getStudentByIdService,
  updateStudentStatusService,
  getStudentCountService,
  deleteStudentService,
} from './student.service.js';

/**
 * Get all students
 * GET /api/admin/students
 * Query params: status, page, limit, search, startDate, endDate
 */
export const getAllStudents = async (req, res) => {
  try {
    const { status, page, limit, search, startDate, endDate } = req.query;

    const filters = {
      status,
      search,
      startDate,
      endDate,
    };

    const result = await getAllStudentsService(filters, page, limit);

    // Check if paginated result
    if (result.data) {
      return res.status(200).json({
        status: true,
        message: 'Students fetched successfully',
        data: result.data,
        pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          limit: result.limit,
        },
      });
    }

    // Return all students (non-paginated)
    return res.status(200).json({
      status: true,
      message: 'Students fetched successfully',
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
 * Get student by ID
 * GET /api/admin/students/:studentId
 */
export const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        status: false,
        message: 'studentId is required',
      });
    }

    const student = await getStudentByIdService(studentId);

    if (!student) {
      return res.status(404).json({
        status: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Student fetched successfully',
      data: student,
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
 * Update student status
 * PATCH /api/admin/students/:studentId/status
 */
export const updateStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: 'Status is required',
      });
    }

    const student = await updateStudentStatusService(studentId, status);

    return res.status(200).json({
      status: true,
      message: 'Student status updated successfully',
      data: student,
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
 * Get student count
 * GET /api/admin/students/count
 */
export const getStudentCount = async (req, res) => {
  try {
    const { status } = req.query;

    const count = await getStudentCountService(status);

    return res.status(200).json({
      status: true,
      message: 'Student count fetched successfully',
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
 * Delete student (soft delete)
 * DELETE /api/admin/students/:studentId
 */
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        status: false,
        message: 'studentId is required',
      });
    }

    const student = await deleteStudentService(studentId);

    return res.status(200).json({
      status: true,
      message: 'Student deleted successfully',
      data: student,
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      status: false,
      message: error.message || 'Server error',
    });
  }
};
