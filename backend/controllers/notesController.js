import multer from "multer";
import path from "path";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import NotesMedia from "../models/NotesMedia.js";
import Course from "../models/Course.js";
import Teacher from "../models/Teacher.js";
import { getPaginatedData } from "../utils/pagination.js";

// Configure multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, documents, videos
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/quicktime',
      'video/x-msvideo',
      'video/mkv',
      'video/webm',
      'video/3gpp',
    ];

    const ext = file.originalname ? path.extname(file.originalname).toLowerCase().replace('.', '') : '';
    const allowedExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
      'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt',
      'mp4', 'avi', 'mov', 'mkv', 'webm', '3gp'
    ];

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      const fileExtDisplay = ext ? `.${ext}` : (file.originalname || 'unknown');
      cb(new Error(`The file format '${fileExtDisplay}' is not supported. Please upload a valid image (JPG, PNG, GIF, WEBP), PDF or document (PDF, DOCX, PPTX), or video file (MP4, MOV, AVI, MKV).`), false);
    }
  },
});

export const addNotes = async (req, res) => {
  try {
    // console.log('Request body:', req.body);
    // console.log('Request file:', req.file);

    const {
      courseCode,
      courseType,
      teacherId,
      title,
      description,
      contentType,
    } = req.body;

    // Validate required fields
    if (!courseCode || !courseType || !teacherId || !title || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseCode, courseType, teacherId, title, contentType'
      });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File upload is required'
      });
    }

    // Fetch courseName from Course table using courseCode
    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const courseName = course.courseName;

    // Fetch teacherName from Teacher table using teacherId
    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherName = teacher.name;

    // Upload file to Cloudinary
    let contentUrl = null;
    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, "notes", "auto", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      });
      contentUrl = result.secure_url;
    } catch (uploadError) {
      console.error('Cloudinary notes upload error:', uploadError);
      return res.status(500).json({ success: false, message: "Error uploading file" });
    }

    // Create NotesMedia entry
    const newNote = await NotesMedia.create({
      courseName,
      courseCode,
      courseType,
      teacherName,
      teacherId,
      title,
      description,
      contentUrl,
      contentType,
    });

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      note: newNote
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const uploadNotesFile = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
    }
    next();
  });
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
    }

    const deletedRows = await NotesMedia.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { courseCode, teacherId, courseType, contentType, page, limit } = req.query;

    if (!courseCode || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'courseCode and teacherId are required'
      });
    }

    const whereClause = {
      courseCode,
      teacherId
    };

    if (courseType) {
      whereClause.courseType = courseType;
    }

    if (contentType) {
      let mappedContentType;
      switch (contentType.toLowerCase()) {
        case 'notes':
          mappedContentType = 'NOTES';
          break;
        case 'image':
          mappedContentType = 'IMAGE';
          break;
        case 'video':
          mappedContentType = 'RECORDED_VIDEO';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid contentType. Must be notes, image, or video'
          });
      }
      whereClause.contentType = mappedContentType;
    }

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

export const editNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const [updatedRows] = await NotesMedia.update(updateData, {
      where: { id }
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or no changes made'
      });
    }

    const updatedNote = await NotesMedia.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const contentCounter = async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'teacherId is required'
      });
    }

    const count = await NotesMedia.count({
      where: { teacherId }
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error counting content:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Stream video - redirects to Cloudinary optimized URL which handles range requests natively
export const streamVideo = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: "Video URL is required" });
    }

    // Redirect to the Cloudinary URL.
    // Cloudinary's CDN automatically handles video streaming and Range requests.
    res.redirect(302, url);
  } catch (error) {
    console.error("Video stream error:", error);
    res.status(500).json({ success: false, message: "Error streaming video" });
  }
};


