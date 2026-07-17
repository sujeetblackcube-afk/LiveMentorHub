import Teacher from "../models/Teacher.js";
import Enrollment from "../models/Enrollment.js";
import Assignment from "../models/Assignment.js";
import NotesMedia from "../models/NotesMedia.js";
import Course from "../models/Course.js";
import LiveSession from "../models/Livesession.js";
import Notification from "../models/Notifications.js";
import sequelize from "../config/db.js";
import TeacherPayout from "../models/Payout.js";
import pkg from 'sequelize';
const { Op } = pkg;

const getTeacherStudentData = async (req, res) => {
  try {
    const teacherId = req.user?.teacherId;
    if (!teacherId) {
      return res
        .status(401)
        .json({ success: false, message: "Teacher ID not found in token" });
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
    const teacher = req.user;

    // ✅ Get teacher course codes
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

    // ✅ Fetch enrollments for ALL courses
    const enrollments = await Enrollment.findAll({
      where: {
        courseCode: teacherCourseCodes, // multiple courses
        teacherId: teacher.teacherId,
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

    // ✅ Deduplicate (same as your logic)
    const uniqueStudentsMap = new Map();

    enrollments.forEach((enrollment) => {
      const key = `${enrollment.studentId}_${enrollment.courseCode}`;
      // 👆 ensures same student in different courses is shown separately

      if (!uniqueStudentsMap.has(key)) {
        uniqueStudentsMap.set(key, enrollment);
      }
    });

    const uniqueStudents = Array.from(uniqueStudentsMap.values());

    return res.status(200).json({
      success: true,
      message: "All students fetched successfully",
      data: uniqueStudents,
      studentCount: uniqueStudents.length,
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
    const teacherId = req.user?.teacherId;
    if (!teacherId) {
      return res
        .status(401)
        .json({ success: false, message: "Teacher ID not found in token" });
    }

    const teacher = await Teacher.findOne({
      where: { teacherId },
      attributes: ["courseCode"],
    });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const courseCodes = Array.isArray(teacher.courseCode)
      ? teacher.courseCode
      : teacher.courseCode
        ? [teacher.courseCode]
        : [];

    // Counts
    const courseCount = courseCodes.length;

    const enrollments = await Enrollment.findAll({
      where: {
        courseCode: { [Op.in]: courseCodes },
        teacherId,
        status: "APPROVED",
      },
      attributes: ["studentId"],
      raw: true,
    });
    const uniqueStudents = [...new Set(enrollments.map((e) => e.studentId))];
    const studentCount = uniqueStudents.length;

    const liveClassTotal = await LiveSession.count({ where: { teacherId } });

    const contentCount = await NotesMedia.count({ where: { teacherId } });

    const earningsResult = await TeacherPayout.findAll({
      where: { teacherId },
      attributes: [[sequelize.fn("SUM", sequelize.col("amount")), "total"]],
      raw: true,
    });
    const totalEarnings =
      earningsResult.length > 0 && earningsResult[0].total
        ? parseFloat(earningsResult[0].total)
        : 0;

    // Ongoing live sessions (update status first)
    const currentTime = new Date();
    await LiveSession.update(
      { status: "ongoing" },
      { where: { status: "upcoming", startTime: { [Op.lte]: currentTime } } },
    );
    await LiveSession.update(
      { status: "completed" },
      { where: { status: "ongoing", endTime: { [Op.lt]: currentTime } } },
    );

    const ongoingLives = await LiveSession.findAll({
      where: { teacherId, status: "ongoing" },
      order: [["startTime", "ASC"]],
    });

    // Courses
    const courses =
      courseCodes.length > 0
        ? await Course.findAll({
            where: { courseCode: { [Op.in]: courseCodes } },
            attributes: ["courseCode", "courseName", "courseType"],
          })
        : [];

    // Top 5 notifications (recent first, diverse types)
    const notifications = await Notification.findAll({
      where: { specificId: teacherId, role: "teacher" },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        counts: {
          courseCount,
          studentCount,
          liveClassTotal,
          contentCount,
          totalEarnings,
        },
        ongoingLives: ongoingLives.map((ls) => ({
          id: ls.id,
          sessionId: ls.sessionId,
          title: ls.title,
          courseName: ls.courseName,
          startTime: ls.startTime,
          endTime: ls.endTime,
          channelName: ls.channelName,
          appId: ls.appId,
        })),
        courses,
        notifications,
      },
    });
  } catch (error) {
    console.error("Error in getTeacherHomepage:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export { getTeacherStudentData, getAllTeacherStudents, getTeacherHomepage };
