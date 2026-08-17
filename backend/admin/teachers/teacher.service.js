/**
 * Admin Teacher Service
 * Handles database operations for admin teacher management
 */

import pkg from 'sequelize';
const { Op } = pkg;
import Teacher from '../../models/Teacher.js';
import Course from '../../models/Course.js';
import { getPaginatedData } from '../../utils/pagination.js';

/**
 * Fetch all teachers with filtering and pagination
 * @param {Object} filters - Filter criteria (status, search, startDate, endDate)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise<Object>} Paginated teacher data
 */
export const getAllTeachersService = async (filters, page, limit) => {
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
    whereClause.createdAt = {
      [Op.between]: [
        new Date(`${startDate} 00:00:00`),
        new Date(`${endDate} 23:59:59`),
      ],
    };
  } else if (startDate) {
    whereClause.createdAt = {
      [Op.gte]: new Date(`${startDate} 00:00:00`),
    };
  } else if (endDate) {
    whereClause.createdAt = {
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
    order: [['createdAt', 'DESC']],
  };

  // If page parameter is supplied, return paginated data
  if (page) {
    return await getPaginatedData(Teacher, queryOptions, page, limit || 10);
  }

  // Otherwise return all teachers
  return await Teacher.findAll(queryOptions);
};

/**
 * Update teacher status
 * @param {string} teacherId - Teacher ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated teacher data
 */
export const updateTeacherStatusService = async (teacherId, status) => {
  const allowedStatus = ['PENDING', 'APPROVED', 'SUSPENDED', 'TERMINATED'];

  if (!allowedStatus.includes(status)) {
    throw {
      statusCode: 400,
      message: 'Invalid status value. Allowed: PENDING, APPROVED, SUSPENDED, TERMINATED',
    };
  }

  const teacher = await Teacher.findByPk(teacherId);

  if (!teacher) {
    throw {
      statusCode: 404,
      message: 'Teacher not found',
    };
  }

  teacher.status = status;
  await teacher.save();

  return teacher;
};

/**
 * Get count of teachers
 * @returns {Promise<number>} Teacher count
 */
export const getTeacherCountService = async () => {
  return await Teacher.count();
};

/**
 * Update teacher course allocation
 * @param {string} teacherId - Teacher ID
 * @param {string|Array} coursename - Course name(s)
 * @returns {Promise<Object>} Updated teacher data
 */
export const updateCoursenameService = async (teacherId, coursename) => {
  if (!coursename || (Array.isArray(coursename) && coursename.length === 0)) {
    throw {
      statusCode: 400,
      message: 'Coursename is required',
    };
  }

  const teacher = await Teacher.findByPk(teacherId);

  if (!teacher) {
    throw {
      statusCode: 404,
      message: 'Teacher not found',
    };
  }

  // Handle both single course name and array of course names
  const courseNames = Array.isArray(coursename) ? coursename : [coursename];
  const courseCodes = [];

  // Find courseCodes for each coursename
  for (const name of courseNames) {
    const course = await Course.findOne({
      where: { courseName: name },
      attributes: ['courseCode'],
    });

    if (!course) {
      throw {
        statusCode: 404,
        message: `Course "${name}" not found`,
      };
    }

    courseCodes.push(course.courseCode);
  }

  teacher.coursename = courseNames;
  teacher.courseCode = courseCodes;

  await teacher.save();

  return teacher;
};

/**
 * Delete teacher (soft delete)
 * Sets status to TERMINATED
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} Updated teacher data
 */
export const deleteTeacherService = async (teacherId) => {
  const teacher = await Teacher.findByPk(teacherId);

  if (!teacher) {
    throw {
      statusCode: 404,
      message: 'Teacher not found',
    };
  }

  // Soft delete - mark as TERMINATED
  teacher.status = 'TERMINATED';
  await teacher.save();

  return teacher;
};
