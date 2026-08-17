/**
 * Admin Course Controller
 * Handles HTTP requests for admin course management
 * Mounted at: /api/superadmin/courses
 */

import {
  getCoursesBySubjectCodeService,
  getCourseParticipantsService,
  updateCourseDetailsService,
} from './course.service.js';

/**
 * Get courses by subject code
 * GET /api/admin/courses/subjects/:subjectCode/courses
 */
export const getSubjectCourses = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const data = await getCoursesBySubjectCodeService(subjectCode);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch subject courses',
    });
  }
};

/**
 * Get course participants (teachers and students)
 * GET /api/admin/courses/:courseCode/participants
 */
export const getCourseParticipantsByCode = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const data = await getCourseParticipantsService(courseCode);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch course participants',
    });
  }
};

/**
 * Update course details
 * PATCH /api/admin/courses/:courseCode
 */
export const patchCourseDetails = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const data = await updateCourseDetailsService(courseCode, req.body || {});
    return res.status(200).json({
      success: true,
      message: 'Course details updated successfully',
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to update course details',
    });
  }
};
