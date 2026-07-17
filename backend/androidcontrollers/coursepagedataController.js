import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import NotesMedia from "../models/NotesMedia.js";
import pkg from 'sequelize';
const { Op } = pkg;
import { 
  getCurrencyInfo, 
  convertCurrency, 
  formatCurrency 
} from "../utils/currencyRates.js";
import {convertCoursePrices} from '../controllers/courseController.js'


export const getCoursesBySubject = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectCode } = req.params;
    const { country } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    // Get currency info based on country
    let currencyInfo = null;
    if (country) {
      currencyInfo = getCurrencyInfo(country);
    }

    // Fetch all active courses for the subjectCode
    const courses = await Course.findAll({
      where: {
        subjectCode,
        status: "Active"
      },
      order: [["rating", "DESC"]],
    });

    // Fetch enrollments for the student
    const enrollments = await Enrollment.findAll({
      where: { studentId },
      attributes: ["courseCode"],
    });

    const enrolledCourseCodes = enrollments.map(enrollment => enrollment.courseCode);

    // Add enrollment status to each course and convert prices
    const coursesWithStatus = courses.map(course => {
      const courseData = convertCoursePrices(course, currencyInfo);
      return {
        ...courseData,
        enrollmentStatus: enrolledCourseCodes.includes(course.courseCode) ? 1 : 0
      };
    });

    return res.status(200).json({
      success: true,
      message: "Courses with enrollment status fetched successfully",
      data: coursesWithStatus,
      currencyInfo: currencyInfo,
    });
  } catch (error) {
    console.error("Get Courses By Subject Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getNotesByStudent = async (req, res) => {
  try {
    const { studentId, courseCode } = req.params;
    const { contentType } = req.query;

    if (!studentId || !courseCode) {
      return res.status(400).json({
        success: false,
        message: "studentId and courseCode are required",
      });
    }

    // Check if the student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: { studentId, courseCode },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }

    // Get the teacherId from the enrollment (the assigned teacher for this student in this course)
    const assignedTeacherId = enrollment.teacherId;

    // Build where clause for notes - filter by courseCode AND the assigned teacher's ID
    const whereClause = { 
      courseCode,
      teacherId: assignedTeacherId 
    };

    if (contentType) {
      whereClause.contentType = contentType;
    }

    // Fetch notes for the course, filtered by contentType if provided
    const notes = await NotesMedia.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
    });
  } catch (error) {
    console.error("Get Notes By Student Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getCoursePageData = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, classname, courseType, difficulty, category, subcategory, targetAudience, board, medium, stream, subjectCode, country } = req.query;

    let mycourses = [];
    let allCourses = [];
    let enrolledCourseCodes = [];

    // Get currency info based on country
    let currencyInfo = null;
    if (country) {
      currencyInfo = getCurrencyInfo(country);
    }

    // If studentId is provided, fetch enrolled courses
    if (studentId) {
      // Fetch all enrollments for the student
      const enrollments = await Enrollment.findAll({
        where: { studentId },
        attributes: ["courseCode"], // Only need courseCode
      });

      if (enrollments.length > 0) {
        // Extract courseCodes
        const courseCodes = enrollments.map(enrollment => enrollment.courseCode);
        enrolledCourseCodes = courseCodes;

        // Fetch course details for these courseCodes
        const courses = await Course.findAll({
          where: {
            courseCode: courseCodes,
          },
        });

        // Add enrollmentStatus: 1 to all mycourses and convert prices
        mycourses = courses.map(course => {
          const courseData = convertCoursePrices(course, currencyInfo);
          return {
            ...courseData,
            enrollmentStatus: 1
          };
        });
      }
    }

    // Build where clause for allCourses filters
    const whereClause = { status: "Active" };

    if (subject) whereClause.subject = subject;
    if (subjectCode) whereClause.subjectCode = subjectCode;
    if (classname) whereClause.classname = classname;
    if (courseType) whereClause.courseType = courseType;
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.category = category;
    if (subcategory) whereClause.subcategory = subcategory;
    if (targetAudience) whereClause.targetAudience = targetAudience;
    if (board) whereClause.board = board;
    if (medium) whereClause.medium = medium;
    if (stream) whereClause.stream = stream;

    if (studentId && enrolledCourseCodes.length > 0) {
      whereClause.courseCode = {
        [Op.notIn]: enrolledCourseCodes,
      };
    }

    // Fetch allCourses with filters (return all active courses)
    const courses = await Course.findAll({
      where: whereClause,
      order: [["rating", "DESC"]],
    });

    // Add enrollmentStatus: 0 to all allCourses and convert prices
    allCourses = courses.map(course => {
      const courseData = convertCoursePrices(course, currencyInfo);
      return {
        ...courseData,
        enrollmentStatus: 0
      };
    });

    return res.status(200).json({
      success: true,
      message: "Course data fetched successfully",
      data: { mycourses, allCourses },
      currencyInfo: currencyInfo,
    });
  } catch (error) {
    console.error("Get Course Page Data Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
