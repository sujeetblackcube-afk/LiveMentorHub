import Teacher from '../models/Teacher.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import NotesMedia from '../models/NotesMedia.js';
import Course from '../models/Course.js';
import LiveSession from '../models/Livesession.js';
import Notification from '../models/Notifications.js';
import sequelize from '../config/db.config.js';
import TeacherPayout from '../models/Payout.js';
import Banner from '../models/Banner.js';
import pkg from 'sequelize';
const { Op } = pkg;

const getTeacherStudentData = async (req, res) => {
  try {
    const teacherId = req.user?.teacherId || req.params?.teacherId;
    if (!teacherId) {
      return res
        .status(401)
        .json({ success: false, message: "Teacher ID not found in request" });
    }

    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const courseCodes = teacher.courseCode || [];
    if (!Array.isArray(courseCodes) || courseCodes.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const coursesData = [];
    for (const courseCode of courseCodes) {
      // Get students (present: APPROVED and not expired)
      const enrollments = await Enrollment.findAll({
        where: {
          teacherId,
          courseCode,
          status: "APPROVED",
          enrollmentExpireDate: {
            [Op.gt]: new Date(),
          },
        },
      });
      const students = enrollments.map((e) => ({
        id: e.studentId,
        name: e.studentName,
        courseName: e.courseName,
        courseCode: e.courseCode,
      }));

      // Get teacher's assignments for this course
      const assignments = await Assignment.findAll({
        where: { teacherId, courseCode },
      });

      // Get all notes for this course (all teachers)
      const notes = await NotesMedia.findAll({
        where: { courseCode },
      });

      const course = await Course.findByPk(courseCode);
      if (!course) {
        console.warn(`Course not found for code: ${courseCode}`);
        continue;
      }

      coursesData.push({
        ...course.toJSON(),
        students,
        assignments,
        notes,
      });
    }

    res.json({ success: true, data: coursesData });
  } catch (error) {
    console.error("Error in getTeacherStudentData:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getAllTeacherStudents = async (req, res) => {
  try {
    let teacher = req.user;
    const teacherIdParam = req.params?.teacherId || req.query?.teacherId || req.auth?.specificId;
    
    if (!teacher && teacherIdParam) {
      teacher = await Teacher.findOne({ where: { teacherId: teacherIdParam } });
    }

    if (!teacher && req.auth?.userId) {
      teacher = await Teacher.findOne({ where: { userId: req.auth.userId } });
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const teacherCourseCodes = teacher.courseCode
      ? Array.isArray(teacher.courseCode)
        ? teacher.courseCode
        : [teacher.courseCode]
      : [];

    if (teacherCourseCodes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No courses assigned",
        data: [],
        studentCount: 0,
      });
    }

    const enrollments = await Enrollment.findAll({
      where: {
        [Op.or]: [
          { teacherId: teacher.teacherId },
          { courseCode: { [Op.in]: teacherCourseCodes } }
        ],
        status: "APPROVED",
      },
      attributes: [
        "studentId",
        "studentName",
        "studentEmail",
        "studentMobile",
        "studentAddress",
        "courseName",
        "courseCode",
        "teacherId",
        "status",
        "paymentStatus",
        "enrollmentCode",
        "enrollmentDate",
      ],
      order: [["createdAt", "DESC"]],
    });

    const uniqueStudentsMap = new Map();
    enrollments.forEach((enrollment) => {
      const key = `${enrollment.studentId}_${enrollment.courseCode}`;
      if (!uniqueStudentsMap.has(key)) {
        uniqueStudentsMap.set(key, enrollment);
      }
    });

    const uniqueStudents = Array.from(uniqueStudentsMap.values());

    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const offset = (page - 1) * limit;
    const nameFilter = (req.query.name || req.query.search || "").trim().toLowerCase();
    const studentIdFilter = (req.query.studentId || "").trim().toLowerCase();

    let filtered = uniqueStudents;
    if (nameFilter) {
      filtered = filtered.filter((s) => s.studentName && s.studentName.toLowerCase().includes(nameFilter));
    }
    if (studentIdFilter) {
      filtered = filtered.filter((s) => s.studentId && s.studentId.toLowerCase().includes(studentIdFilter));
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const paginatedData = req.query.page || req.query.limit ? filtered.slice(offset, offset + limit) : filtered;

    return res.status(200).json({
      success: true,
      message: "All students fetched successfully",
      data: paginatedData,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      studentCount: totalCount,
    });
  } catch (error) {
    console.error("Get All Teacher Students Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getTeacherHomepage = async (req, res) => {
  try {
    let teacherId =
      req.user?.teacherId ||
      req.params?.teacherId ||
      req.query?.teacherId ||
      req.auth?.specificId;
    let teacher;

    if (teacherId) {
      teacher = await Teacher.findOne({ where: { teacherId } });
    }

    if (!teacher && req.auth?.userId) {
      teacher = await Teacher.findOne({ where: { userId: req.auth.userId } });
    }

    if (!teacher && req.user) {
      teacher = req.user;
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        status: false,
        message: "Teacher not found",
      });
    }

    teacherId = teacher.teacherId;

    const courseCodes = Array.isArray(teacher.courseCode)
      ? teacher.courseCode
      : teacher.courseCode
        ? [teacher.courseCode]
        : [];

    // 1. Total Courses
    const courses =
      courseCodes.length > 0
        ? await Course.findAll({
            where: { courseCode: { [Op.in]: courseCodes } },
            attributes: [
              "courseCode",
              "courseName",
              "courseType",
              "thumbnail",
              "status",
              "rating",
            ],
          })
        : [];
    const courseCount = Math.max(courseCodes.length, courses.length);

    // 2. Total Students
    let studentCount = 0;
    if (courseCodes.length > 0) {
      const enrollments = await Enrollment.findAll({
        where: {
          [Op.or]: [
            { teacherId },
            { courseCode: { [Op.in]: courseCodes } }
          ],
          status: "APPROVED",
        },
        attributes: ["studentId"],
        raw: true,
      });
      const uniqueStudents = [...new Set(enrollments.map((e) => e.studentId))];
      studentCount = uniqueStudents.length;
    }

    // 3. Total Live Classes / Sessions
    const liveClassTotal = await LiveSession.count({
      where: { teacherId },
    }).catch(() => 0);

    // 4. Content Count
    const contentCount = await NotesMedia.count({ where: { teacherId } }).catch(() => 0);

    // 5. Total Earnings
    let totalEarnings = 0;
    try {
      const earningsResult = await TeacherPayout.findAll({
        where: { teacherId },
        attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "total"]],
        raw: true,
      });
      if (earningsResult.length > 0 && earningsResult[0]?.total) {
        totalEarnings = parseFloat(earningsResult[0].total);
      }
    } catch (e) {
      totalEarnings = Number(teacher.earnings) || 0;
    }

    // 6. Active Banners
    const banners = await Banner.findAll({
      where: { status: "active" },
      order: [["createdAt", "DESC"]],
    }).catch(() => []);

    // 7. Live Sessions (Ongoing & Recent)
    const currentTime = new Date();
    await LiveSession.update(
      { status: "ongoing" },
      { where: { status: "upcoming", startTime: { [Op.lte]: currentTime } } },
    ).catch(() => {});
    await LiveSession.update(
      { status: "completed" },
      { where: { status: "ongoing", endTime: { [Op.lt]: currentTime } } },
    ).catch(() => {});

    const liveClasses = await LiveSession.findAll({
      where: { teacherId },
      order: [["startTime", "DESC"]],
      limit: 10,
    }).catch(() => []);

    // 8. Notifications
    const notifications = await Notification.findAll({
      where: { specificId: teacherId, role: "teacher" },
      order: [["createdAt", "DESC"]],
      limit: 5,
    }).catch(() => []);

    const responseData = {
      // Top-level counts for direct mobile/web consumption
      totalStudents: studentCount,
      totalLiveClasses: liveClassTotal,
      totalCourse: courseCount,
      totalCourses: courseCount,
      totalEarnings: totalEarnings,
      formattedEarnings: `₹${totalEarnings.toLocaleString()}`,

      // Nested counts object for legacy/alternative callers
      counts: {
        totalStudents: studentCount,
        studentCount: studentCount,
        totalLiveClasses: liveClassTotal,
        liveClassTotal: liveClassTotal,
        totalCourse: courseCount,
        totalCourses: courseCount,
        courseCount: courseCount,
        contentCount: contentCount,
        totalEarnings: totalEarnings,
        formattedEarnings: `₹${totalEarnings.toLocaleString()}`,
      },

      // Profile snapshot
      teacherProfile: {
        teacherId: teacher.teacherId,
        name: teacher.name,
        email: teacher.email,
        mobile: teacher.mobile,
        profileImage: teacher.profileImage,
        status: teacher.status,
      },

      // Lists
      banners,
      topRatedCourses: courses,
      courses,
      liveClasses,
      upcomingClasses: liveClasses,
      notifications,
    };

    return res.status(200).json({
      success: true,
      status: true,
      message: "Teacher homescreen data fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error in getTeacherHomepage:", error);
    return res.status(500).json({
      success: false,
      status: false,
      message: "Server error fetching homescreen data",
      error: error.message,
    });
  }
};

export { getTeacherStudentData, getAllTeacherStudents, getTeacherHomepage };
