import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import Syllabus from "../models/Syllabus.js";
import pkg from 'sequelize';
const { Op } = pkg;
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  getCurrencyFromCountry, 
  convertCurrency, 
  formatCurrency,
  getCurrencyInfo 
} from "../utils/currencyRates.js";

export const convertCoursePrices = (course, currencyInfo) => {
  const courseData = course.toJSON ? course.toJSON() : course;
  
  if (currencyInfo) {
    const convertedMrp = convertCurrency(
      parseFloat(course.mrp || 0),
      currencyInfo.currencyCode
    );

    const convertedDiscount = convertCurrency(
      parseFloat(course.discountedprice || 0),
      currencyInfo.currencyCode
    );

    // ✅ Keep same type as DB (STRING like "1200.00")
    courseData.convertedMrp = Number(convertedMrp).toFixed(2);
    courseData.convertedDiscountedPrice = Number(convertedDiscount).toFixed(2);

    // ✅ Remove symbol from formatted (only numeric string)
    courseData.formattedMrp = Number(convertedMrp).toFixed(2);
    courseData.formattedDiscountedPrice = Number(convertedDiscount).toFixed(2);

    // Keep currency info separately
    courseData.currencyCode = currencyInfo.currencyCode;
    courseData.currencySymbol = currencyInfo.symbol;
  }
  
  return courseData;
};

// Helper function to generate course id globally
const generateCourseId = async () => {
  // Find the maximum id across all course tables
  const lastCourse = await Course.findOne({
    order: [["id", "DESC"]],
    attributes: ["id"],
  });

  let nextId = 1;
  if (lastCourse && lastCourse.id) {
    nextId = lastCourse.id + 1;
  }

  return nextId;
};

export const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseType,
      courseDescription,
      mrp,
      discountedprice,
      courseStartDate,
      difficulty,
      deadline,
      courseDuration,
      board,
      medium,
      classname,
      subject,
      stream,
      category,
      subcategory,
      targetAudience,
      totalLessons,
    } = req.body;

    // Required validation
    if (!courseName || !courseType || !courseDescription || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Course name, type, description, and difficulty are required",
      });
    }

    // Generate course code: first 3 letters + YYYYMMDD + sequential number
    const prefix = courseName
      .replace(/\s+/g, "")
      .substring(0, 3)
      .toUpperCase();

    const today = new Date();
    const dateStr = today.getFullYear().toString() +
                   String(today.getMonth() + 1).padStart(2, '0') 

    // Find last course with same prefix and date
    const lastCourse = await Course.findOne({
      where: {
        courseCode: {
          [Op.like]: `${prefix}${dateStr}%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    let nextNumber = 1;
    if (lastCourse) {
      const lastCode = lastCourse.courseCode;
      const lastNumber = parseInt(lastCode.replace(`${prefix}${dateStr}`, ""), 10);
      nextNumber = lastNumber + 1;
    }

    // Format code with sequential number (up to 8 digits as requested)
    const courseCode = `${prefix}${dateStr}${String(nextNumber).padStart(8, "0")}`;

    // Handle thumbnail upload
    let thumbnailPath = null;
    if (req.file) {
      thumbnailPath = `/uploads/thumbnails/${req.file.filename}`;
    }
    // Generate global course id
    const id = await generateCourseId();

    // Fetch subject code if subject is provided (MUST match BOTH subjectName and class)
    let subjectCode = null;
    if (subject && classname) {
      const subjectRecord = await Subject.findOne({
        where: {
          subjectName: subject,
          ForClass: classname,
          status: "ACTIVE",
        },
        attributes: ["subjectCode"],
      });
      if (subjectRecord) {
        subjectCode = subjectRecord.subjectCode;
      }
    }


    // Create course
    const course = await Course.create({
      id,
      courseName,
      courseCode,
      courseType,
      courseDescription,
      thumbnail: thumbnailPath,
      difficulty,
      mrp,
      deadline,
      discountedprice,
      courseStartDate: courseStartDate || 0,
      courseDuration,
      board,
      medium,
      classname,
      subject,
      subjectCode,
      stream,
      category,
      subcategory,
      targetAudience,
      totalLessons: totalLessons || 0,
      status: "Active", // default
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { status, courseType, difficulty, board, medium, classname, subject, category } = req.query;

    const where = {};
    if (status) where.status = status;
    if (courseType) where.courseType = courseType;
    if (difficulty) where.difficulty = difficulty;
    if (board) where.board = { [Op.like]: `%${board}%` };
    if (medium) where.medium = { [Op.like]: `%${medium}%` };
    if (classname) where.classname = { [Op.like]: `%${classname}%` };
    if (subject) where.subject = { [Op.like]: `%${subject}%` };
    if (category) where.category = { [Op.like]: `%${category}%` };

    const courses = await Course.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [{
        model: Syllabus,
        as: 'syllabus',
        required: false
      }]
    });

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseCode } = req.params;

    const course = await Course.findByPk(courseCode);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;

    const course = await Course.findByPk(courseCode);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Handle thumbnail upload
    if (req.file) {
      // Delete old thumbnail file if exists
      if (course.thumbnail) {
        const oldFilePath = path.join(process.cwd(), course.thumbnail);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      // Set new thumbnail path
      course.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    // Allowed fields to update
    const allowedFields = [
      "courseName",
      "courseType",
      "courseDescription",
      "difficulty",
      // ✅ these are the real DB columns used in Course model
      "mrp",
      "discountedprice",
      "deadline",
      "courseDuration",
      "board",
      "medium",
      "classname",
      "subject",
      "stream",
      "category",
      "subcategory",
      "targetAudience",
      "totalLessons",
    ];


    allowedFields.forEach((field) => {
      if (req.body && req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    // Update subjectCode if subject is being updated (match BOTH subjectName and class)
    if (req.body && req.body.subject !== undefined) {
      const nextClassname = req.body.classname ?? course.classname;
      const subjectRecord = await Subject.findOne({
        where: {
          subjectName: req.body.subject,
          ForClass: nextClassname,
          status: "ACTIVE",
        },
        attributes: ["subjectCode"],
      });

      course.subjectCode = subjectRecord ? subjectRecord.subjectCode : null;
    }


    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;

    const course = await Course.findByPk(courseCode);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Delete associated syllabus first (course + syllabus should be deleted together)
    await Syllabus.destroy({ where: { courseCode } });

    await course.destroy();

    return res.status(200).json({
      success: true,
      message: "Course and syllabus deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCourseStatus = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { status } = req.body;

    const allowedStatus = ["Active", "Inactive"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const course = await Course.findByPk(courseCode);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check deadline for deactivation
    if (course.deadline && new Date() > new Date(course.deadline)) {
      course.status = "Inactive"; // or "Inactive" if you have that status
    } else {
      course.status = status;
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course status updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Update Course Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Multer configuration for thumbnail uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'thumbnails');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const getCourseCount = async (req, res) => {
  try {
    const count = await Course.count();
    return res.status(200).json({
      success: true,
      message: "Course count fetched successfully",
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const uploadThumbnail = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to deactivate courses that have passed their deadline
export const deactivateExpiredCourses = async () => {
  try {
    const now = new Date();
    
    // Find all active courses where deadline has passed
    const expiredCourses = await Course.findAll({
      where: {
        status: "Active",
        deadline: {
          [Op.lt]: now // deadline is less than current time
        }
      }
    });

    if (expiredCourses.length > 0) {
      // Update all expired courses to Inactive
      const updatedCount = await Course.update(
        { status: "Inactive" },
        {
          where: {
            status: "Active",
            deadline: {
              [Op.lt]: now
            }
          }
        }
      );

      // console.log(`[Cron] Deactivated ${updatedCount[0]} expired courses at ${now.toISOString()}`);
      return updatedCount[0];
    }

    // console.log(`[Cron] No expired courses found at ${now.toISOString()}`);
    return 0;
  } catch (error) {
    console.error("[Cron] Error deactivating expired courses:", error);
    throw error;
  }
};





