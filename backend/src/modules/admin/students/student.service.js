/**
 * Admin Student Service
 * Handles database operations for admin student management
 */

import pkg from 'sequelize';
const { Op } = pkg;
import Student from '../../../models/Student.js';
import Enrollment from '../../../models/Enrollment.js';
import { getPaginatedData } from '../../../utils/pagination.js';

/**
 * Fetch all students with filtering and pagination
 * @param {Object} filters - Filter criteria (status, search, startDate, endDate)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Paginated student data
 */
export const getAllStudentsService = async (filters, page, limit) => {
  const { status, search, startDate, endDate } = filters;
  const whereClause = {};

  // Filter by status
  if (status && status !== 'all') {
    whereClause.status = status;
  }

  // Filter by search term (name)
  if (search) {
    whereClause.name = {
      [Op.like]: `%${search}%`,
    };
  }

  // Filter by date range
  if (startDate && endDate) {
    whereClause.updatedAt = {
      [Op.between]: [
        new Date(`${startDate} 00:00:00`),
        new Date(`${endDate} 23:59:59`),
      ],
    };
  } else if (startDate) {
    whereClause.updatedAt = {
      [Op.gte]: new Date(`${startDate} 00:00:00`),
    };
  } else if (endDate) {
    whereClause.updatedAt = {
      [Op.lte]: new Date(`${endDate} 23:59:59`),
    };
  }

  const queryOptions = {
    where: whereClause,
    attributes: {
      exclude: [
        'passwordHash',
        'otp',
        'otpExpiresAt',
        'playerId',
        'userId',
      ],
    },
    include: [
      {
        model: Enrollment,
        as: 'enrollments',
        attributes: ['courseName', 'status'],
      },
    ],
    order: [['createdAt', 'DESC']],
  };

  // If page parameter is supplied, return paginated data
  if (page) {
    return await getPaginatedData(Student, queryOptions, page, limit || 10);
  }

  // Otherwise return all students
  return await Student.findAll(queryOptions);
};

/**
 * Fetch a single student by ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Student data
 */
export const getStudentByIdService = async (studentId) => {
  return await Student.findByPk(studentId, {
    attributes: {
      exclude: [
        'passwordHash',
        'otp',
        'otpExpiresAt',
        'createdAt',
        'updatedAt',
        'playerId',
        'userId',
      ],
    },
  });
};

/**
 * Update student status
 * @param {string} studentId - Student ID
 * @param {string} status - New status (APPROVED, SUSPENDED, TERMINATED)
 * @returns {Promise<Object>} Updated student data
 */
export const updateStudentStatusService = async (studentId, status) => {
  const allowedStatus = ['APPROVED', 'SUSPENDED', 'TERMINATED'];

  if (!allowedStatus.includes(status)) {
    throw {
      statusCode: 400,
      message: 'Invalid status value. Allowed: APPROVED, SUSPENDED, TERMINATED',
    };
  }

  const student = await Student.findByPk(studentId);

  if (!student) {
    throw {
      statusCode: 404,
      message: 'Student not found',
    };
  }

  student.status = status;
  await student.save();

  return student;
};

/**
 * Get count of students
 * @param {string} status - Optional filter by status
 * @returns {Promise<number>} Student count
 */
export const getStudentCountService = async (status) => {
  const whereClause = {};

  if (status && status !== 'all') {
    whereClause.status = status;
  }

  return await Student.count({
    where: whereClause,
  });
};

/**
 * Delete student (soft delete)
 * Sets status to TERMINATED
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Updated student data
 */
export const deleteStudentService = async (studentId) => {
  const student = await Student.findByPk(studentId);

  if (!student) {
    throw {
      statusCode: 404,
      message: 'Student not found',
    };
  }

  // Soft delete - mark as TERMINATED
  student.status = 'TERMINATED';
  await student.save();

  return student;
};
