/**
 * Teacher course module controller.
 * Internal refactor only; public route remains /api/teachers/*.
 */

import {
  getTeacherCoursesService,
  getTeacherCourseStudentsService,
} from './teacherCourse.service.js';

export const getTeacherCourses = async (req, res) => {
  try {
    const data = await getTeacherCoursesService(req.user, req.query);
    return res.status(200).json({
      status: true,
      message: 'Teacher courses fetched successfully',
      data: data.data,
      ...(data.pagination ? { pagination: data.pagination } : {}),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch teacher courses',
    });
  }
};

export const getTeacherCourseStudents = async (req, res) => {
  try {
    const data = await getTeacherCourseStudentsService(req.user, req.params.courseCode, req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch teacher course students',
    });
  }
};
