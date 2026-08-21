import NotesMedia from '../../../models/NotesMedia.js';
import Course from '../../../models/Course.js';
import Teacher from '../../../models/Teacher.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const getNotes = async (req, res) => {
  try {
    const { courseCode, teacherId, contentType, page, limit } = req.query;

    const whereClause = {};
    if (courseCode) whereClause.courseCode = courseCode;
    if (teacherId) whereClause.teacherId = teacherId;
    if (contentType) whereClause.contentType = contentType;

    const queryOptions = {
      where: whereClause,
      order: [['createdAt', 'DESC']]
    };

    if (page || limit) {
      const paginatedResult = await getPaginatedData(
        NotesMedia,
        queryOptions,
        page || 1,
        limit || 10
      );
      return res.status(200).json({
        success: true,
        notes: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        }
      });
    }

    const notes = await NotesMedia.findAll(queryOptions);

    res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const streamVideo = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: "Video URL is required" });
    }
    res.redirect(302, url);
  } catch (error) {
    console.error("Video stream error:", error);
    res.status(500).json({ success: false, message: "Error streaming video" });
  }
};
