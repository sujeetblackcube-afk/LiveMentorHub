import Syllabus from '../models/Syllabus.js';
import Course from '../models/Course.js';
import pkg from 'sequelize';
const { Op } = pkg;
import multer from "multer";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

const validateCourseExists = async (courseCode, courseName = null) => {
  const where = { courseCode };
  if (courseName) where.courseName = courseName;
  
  const course = await Course.findOne({ where });
  if (!course) {
    throw new Error('course not found');
  }
  return course;
};

// Configure multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for syllabus docs
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword' // DOC
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC/DOCX files are allowed.'), false);
    }
  },
});

export const uploadSyllabusFile = upload.single('file');

export const addUpdateSyllabus = async (req, res) => {
  try {
    const { courseName, courseCode } = req.body;

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File upload is required'
      });
    }

    if (!courseCode) {
      return res.status(400).json({
        success: false,
        message: 'courseCode is required'
      });
    }

    const course = await validateCourseExists(courseCode, courseName);

    // Upload to Cloudinary
    let syllabusUrl = null;
    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, "syllabus", "raw");
      syllabusUrl = result.secure_url;
    } catch (uploadError) {
      return res.status(500).json({ success: false, message: "Error uploading syllabus file" });
    }

    // Upsert: create or update
    await Syllabus.upsert({
      courseCode,
      courseName: course.courseName, 
      syllabusUrl
    });

    const syllabus = await Syllabus.findByPk(courseCode);

    return res.status(200).json({
      success: true,
      message: 'Syllabus added/updated successfully',
      data: syllabus
    });
  } catch (error) {
    if (error.message === 'course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    console.error('Add/Update Syllabus Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSyllabus = async (req, res) => {
  try {
    const { courseCode } = req.params;

    if (!courseCode) {
      return res.status(400).json({
        success: false,
        message: 'courseCode is required'
      });
    }

    const syllabus = await Syllabus.findByPk(courseCode);
    if (!syllabus) {
      return res.status(200).json({
        success: true,
        data: {
          courseCode,
          syllabusUrl: null,
          syllabusPoints: []
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: syllabus
    });
  } catch (error) {
    console.error('Get Syllabus Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const addBulletPoints = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { courseName, bulletPoints } = req.body; // comma-separated string

    if (!courseCode || !bulletPoints) {
      return res.status(400).json({
        success: false,
        message: 'courseCode and bulletPoints are required'
      });
    }

    const course = await validateCourseExists(courseCode, courseName);

    const newPoints = bulletPoints.split(',').map(p => p.trim()).filter(p => p);
    
    let syllabus = await Syllabus.findByPk(courseCode);

    if (!syllabus) {
      syllabus = await Syllabus.create({
        courseCode,
        courseName: course.courseName,
        syllabusPoints: newPoints
      });

    } else {
      const uniquePoints = [...new Set([
        ...(syllabus.syllabusPoints || []),
        ...newPoints
      ])];
      syllabus.syllabusPoints = uniquePoints;
      await syllabus.save();
    }


    return res.status(200).json({
      success: true,
      message: 'Bullet points added successfully',
      data: syllabus
    });
  } catch (error) {
    if (error.message === 'course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    console.error('Add Bullet Points Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateBulletPoints = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { courseName, bulletPoints } = req.body; // comma-separated or array

    if (!courseCode || !bulletPoints) {
      return res.status(400).json({
        success: false,
        message: 'courseCode and bulletPoints are required'
      });
    }

    const course = await validateCourseExists(courseCode, courseName);

    let points = Array.isArray(bulletPoints) ? bulletPoints : bulletPoints.split(',').map(p => p.trim()).filter(p => p);


    await Syllabus.upsert({
      courseCode,
      courseName: course.courseName,
      syllabusPoints: points
    });

    const syllabus = await Syllabus.findByPk(courseCode);

    return res.status(200).json({
      success: true,
      message: 'Bullet points updated successfully',
      data: syllabus
    });
  } catch (error) {
    if (error.message === 'course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    console.error('Update Bullet Points Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};




