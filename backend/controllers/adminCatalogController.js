import {
  getClassStats,
  getClassHierarchy,
  getCoursesBySubjectCode,
  getCourseParticipants,
  updateCourseDetails,
} from '../services/adminCatalogService.js';

export const getClassSummary = async (req, res) => {
  try {
    const data = await getClassStats();
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

export const getClassHierarchyById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getClassHierarchy(id);
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

export const getSubjectCourses = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const data = await getCoursesBySubjectCode(subjectCode);
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

export const getCourseParticipantsByCode = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const data = await getCourseParticipants(courseCode);
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

export const patchCourseDetails = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const data = await updateCourseDetails(courseCode, req.body || {});
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
