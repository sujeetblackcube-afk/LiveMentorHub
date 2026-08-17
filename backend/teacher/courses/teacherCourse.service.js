import Course from '../../models/Course.js';
import Enrollment from '../../models/Enrollment.js';
import { getPaginatedData } from '../../utils/pagination.js';
import pkg from 'sequelize';
const { Op } = pkg;

export const getTeacherCoursesService = async (teacher, query) => {
  const { page, limit } = query;
  const courseCodes = teacher.courseCode
    ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
    : [];

  if (courseCodes.length === 0) {
    return {
      data: [],
    };
  }

  const queryOptions = {
    where: {
      courseCode: { [Op.in]: courseCodes },
    },
    attributes: ['courseCode', 'courseName', 'courseDescription', 'thumbnail', 'status', 'createdAt', 'courseType', 'rating', 'deadline', 'courseStartDate', 'courseDuration', 'totalenrollment'],
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    return await getPaginatedData(Course, queryOptions, Number(page || 1), Number(limit || 10));
  }

  const courses = await Course.findAll(queryOptions);
  return { data: courses };
};

export const getTeacherCourseStudentsService = async (teacher, courseCode, query) => {
  if (!courseCode) {
    const error = new Error('Course code is required');
    error.statusCode = 400;
    throw error;
  }

  const teacherCourseCodes = teacher.courseCode
    ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
    : [];

  if (!teacherCourseCodes.includes(courseCode)) {
    const error = new Error('You are not authorized to view students for this course');
    error.statusCode = 403;
    throw error;
  }

  const { page, limit } = query;
  const queryOptions = {
    where: {
      courseCode,
      teacherId: teacher.teacherId,
      status: 'APPROVED',
    },
    attributes: [
      'studentId',
      'studentName',
      'studentEmail',
      'studentMobile',
      'studentAddress',
      'courseName',
      'courseCode',
      'teacherId',
      'status',
      'paymentStatus',
      'enrollmentCode',
      'enrollmentDate',
    ],
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    const paginatedResult = await getPaginatedData(Enrollment, queryOptions, Number(page || 1), Number(limit || 10));
    return {
      success: true,
      message: 'Distinct students fetched successfully',
      data: paginatedResult.data,
      studentCount: paginatedResult.totalItems,
      pagination: {
        totalItems: paginatedResult.totalItems,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage,
        limit: paginatedResult.limit,
      },
    };
  }

  const enrollments = await Enrollment.findAll(queryOptions);
  const uniqueStudentsMap = new Map();
  enrollments.forEach((enrollment) => {
    if (!uniqueStudentsMap.has(enrollment.studentId)) {
      uniqueStudentsMap.set(enrollment.studentId, enrollment);
    }
  });

  const uniqueStudents = Array.from(uniqueStudentsMap.values());

  return {
    success: true,
    message: 'Distinct students fetched successfully',
    data: uniqueStudents,
    studentCount: uniqueStudents.length,
  };
};
