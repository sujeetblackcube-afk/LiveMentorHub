import pkg from 'sequelize';
const { Op } = pkg;
import Banner from "../models/Banner.js";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import Class from "../models/Class.js";
import Enrollment from "../models/Enrollment.js";
import { 
  getCurrencyInfo, 
  convertCurrency, 
  formatCurrency 
} from "../utils/currencyRates.js";
import {convertCoursePrices} from '../controllers/courseController.js'

export const getHomeData = async (req, res) => {
  try {
    // Get params
    const { studentId } = req.params;
    const { courseType, country } = req.query; // ?courseType=academic&country=UAE

    // Get currency info based on country
    let currencyInfo = null;
    if (country) {
      currencyInfo = getCurrencyInfo(country);
    }

    // ===============================
    // 1️⃣ Banner Data (First Section)
    // ===============================
    const banners = await Banner.findAll({
      where: { status: "active" },
      order: [["createdAt", "DESC"]],
    });

    // ==================================
    // 2️⃣ Top Rated / Featured Courses
    // (Apply filter only here)
    // ==================================
    const courseWhere = {
      status: "Active",
    };

    // Apply courseType filter if provided
    if (courseType) {
      courseWhere.courseType = courseType; 
      // example: academic, non-academic, etc.
    }

    let topRatedCourses = await Course.findAll({
      where: courseWhere,
      order: [["rating", "DESC"]],
      limit: 10,
    });

    // If student is logged in, add enrollment status
    if (studentId) {
      const enrollments = await Enrollment.findAll({
        where: { studentId },
        attributes: ["courseCode"],
      });

      const enrolledCourseCodes = enrollments.map(
        (enrollment) => enrollment.courseCode
      );

      topRatedCourses = topRatedCourses.map((course) => {
        const courseData = convertCoursePrices(course, currencyInfo);
        return {
          ...courseData,
          enrollmentStatus: enrolledCourseCodes.includes(course.courseCode)
            ? 1
            : 0,
        };
      });
    } else {
      // Convert prices even if no student is logged in
      topRatedCourses = topRatedCourses.map((course) => 
        convertCoursePrices(course, currencyInfo)
      );
    }

    // ===============================
    // 3️⃣ Classes with Subjects (Third Section)
    // ===============================
    const classes = await Class.findAll({
      where: { status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    const classesWithSubjects = await Promise.all(
      classes.map(async (classItem) => {
        const subjects = await Subject.findAll({
          where: {
            ForClass: classItem.className,
            status: "ACTIVE",
          },
          order: [["created_at", "DESC"]],
        });

        return {
          ...classItem.toJSON(),
          subjects,
        };
      })
    );

    // ===============================
    // Final Response
    // ===============================
    return res.status(200).json({
      success: true,
      data: {
        banners,
        topRatedCourses,
        classes: classesWithSubjects,
        quickaccess: [],
        upcomingclasses: [],
      },
      currencyInfo: currencyInfo,
    });
  } catch (error) {
    console.error("Home API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
