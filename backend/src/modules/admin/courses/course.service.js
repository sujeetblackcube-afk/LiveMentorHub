/**
 * Admin Course Service
 * Handles database operations for admin course management
 */

import { Op } from 'sequelize';
import Course from '../../../models/Course.js';
import Subject from '../../../models/Subject.js';
import Enrollment from '../../../models/Enrollment.js';
import Teacher from '../../../models/Teacher.js';

/**
 * Parse JSON list helper
 */
const parseJsonList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return String(value)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
};



/**
 * Get courses by subject code
 * @param {string} subjectCode - Subject code
 * @returns {Promise<Array>} Array of courses
 */
export const getCoursesBySubjectCodeService = async (subjectCode) => {
  const subject = await Subject.findByPk(subjectCode);

  if (!subject) {
    throw {
      statusCode: 404,
      message: 'Subject not found',
    };
  }

  const courses = await Course.findAll({
    where: { subjectCode },
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  return courses.map((course) => ({
    courseCode: course.courseCode,
    courseName: course.courseName,
    courseDescription: course.courseDescription,
    courseType: course.courseType,
    difficulty: course.difficulty,
    mrp: course.mrp,
    discountedprice: course.discountedprice,
    status: course.status,
    totalenrollment: course.totalenrollment,
    classname: course.classname,
    subject: course.subject,
    subjectCode: course.subjectCode,
    thumbnail: course.thumbnail,
    introVideo: course.introVideo,
    totalReviews: course.totalReviews,
    rating: course.rating,
    courseStartDate: course.courseStartDate,
    deadline: course.deadline,
  }));
};

/**
 * Get course participants (teachers and students)
 * @param {string} courseCode - Course code
 * @returns {Promise<Object>} Object with teachers and students arrays
 */
export const getCourseParticipantsService = async (courseCode) => {
  const course = await Course.findByPk(courseCode);

  if (!course) {
    throw {
      statusCode: 404,
      message: 'Course not found',
    };
  }

  const teacherRows = await Teacher.findAll({ raw: true });
  const teachers = teacherRows
    .filter((teacher) => {
      const assignedCourseCodes = parseJsonList(teacher.courseCode);
      return assignedCourseCodes.includes(courseCode);
    })
    .map((teacher) => ({
      teacherId: teacher.teacherId,
      name: teacher.name,
      email: teacher.email,
      mobile: teacher.mobile,
      whatsappNumber: teacher.whatsappNumber,
      status: teacher.status,
    }));

  const studentRows = await Enrollment.findAll({
    where: { courseCode },
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  const students = studentRows.map((student) => ({
    studentId: student.studentId,
    name: student.studentName,
    email: student.studentEmail,
    progressPercentage: student.progress ?? 0,
    paymentStatus: student.paymentStatus,
    status: student.status,
  }));

  return {
    teachers,
    students,
  };
};

/**
 * Update course details
 * @param {string} courseCode - Course code
 * @param {Object} payload - Fields to update
 * @returns {Promise<Object>} Updated course
 */
export const updateCourseDetailsService = async (courseCode, payload = {}) => {
  const course = await Course.findByPk(courseCode);

  if (!course) {
    throw {
      statusCode: 404,
      message: 'Course not found',
    };
  }

  const forbiddenKeys = new Set(['courseCode', 'id', 'rating', 'totalReviews', 'createdAt', 'updatedAt']);
  const allowedFields = [
    'courseName',
    'courseDescription',
    'courseType',
    'difficulty',
    'mrp',
    'discountedprice',
    'status',
    'deadline',
    'courseStartDate',
    'courseDuration',
    'board',
    'medium',
    'classname',
    'subject',
    'stream',
    'category',
    'subcategory',
    'targetAudience',
    'totalLessons',
    'thumbnail',
    'introVideo',
  ];

  for (const [field, value] of Object.entries(payload)) {
    if (forbiddenKeys.has(field)) continue;
    if (!allowedFields.includes(field)) continue;

    course[field] = value;
  }

  if (payload.subject !== undefined || payload.classname !== undefined) {
    const nextClassName = payload.classname ?? course.classname;
    const nextSubjectName = payload.subject ?? course.subject;

    if (nextClassName && nextSubjectName) {
      const match = await Subject.findOne({
        where: { subjectName: nextSubjectName, ForClass: nextClassName, status: 'ACTIVE' },
        attributes: ['subjectCode'],
        raw: true,
      });

      course.subjectCode = match ? match.subjectCode : null;
    }
  }

  await course.save();

  const normalizedCourse = course.toJSON();
  if (normalizedCourse.mrp !== null && normalizedCourse.mrp !== undefined) {
    normalizedCourse.mrp = Number(normalizedCourse.mrp).toFixed(2);
  }
  if (normalizedCourse.discountedprice !== null && normalizedCourse.discountedprice !== undefined) {
    normalizedCourse.discountedprice = Number(normalizedCourse.discountedprice).toFixed(2);
  }

  return normalizedCourse;
};
