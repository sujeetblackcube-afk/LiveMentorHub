import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Livesession from "../models/Livesession.js";
import pkg from 'sequelize';
const { Op } = pkg;
import { getPaginatedData } from "../utils/pagination.js";

// Get all teachers (with optional pagination and name search)
const getAllTeachers = async (req, res) => {
  try {
    const { status, startDate, endDate, page, limit, search } = req.query;

    const whereClause = {};

    // filter by status
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // filter by search term (name)
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

    // filter by date range (createdAt)
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [
          new Date(`${startDate} 00:00:00`),
          new Date(`${endDate} 23:59:59`),
        ],
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(`${startDate} 00:00:00`),
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(`${endDate} 23:59:59`),
      };
    }

    const queryOptions = {
      where: whereClause,
      attributes: {
        exclude: [
          "passwordHash",
          "otp",
          "otpExpiresAt",
          "playerId",
          "userId"
        ]
      },
      order: [["createdAt", "DESC"]],
    };

    if (page) {
      const paginatedResult = await getPaginatedData(
        Teacher,
        queryOptions,
        page,
        limit || 10
      );
      return res.status(200).json({
        status: true,
        message: "Teachers fetched successfully",
        data: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const teachers = await Teacher.findAll(queryOptions);

    return res.status(200).json({
      status: true,
      message: "Teachers fetched successfully",
      data: teachers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update teacher status
const updateTeacherStatus = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["PENDING", "APPROVED", "SUSPENDED", "TERMINATED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value",
      });
    }

    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    teacher.status = status;
    await teacher.save();

    return res.status(200).json({
      status: true,
      message: "Teacher status updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get teacher count
const getTeacherCount = async (req, res) => {
  try {
    const count = await Teacher.count();
    return res.status(200).json({
      status: true,
      message: "Teacher count fetched successfully",
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// alloted teacher course update by admin
const updateCoursename = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { coursename } = req.body;

    if (!coursename || (Array.isArray(coursename) && coursename.length === 0)) {
      return res.status(400).json({
        status: false,
        message: "Coursename is required",
      });
    }

    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    // Handle both single course name and array of course names
    const courseNames = Array.isArray(coursename) ? coursename : [coursename];
    const courseCodes = [];

    // Find courseCodes for each coursename
    for (const name of courseNames) {
      const course = await Course.findOne({
        where: { courseName: name },
        attributes: ["courseCode"],
      });

      if (!course) {
        return res.status(404).json({
          status: false,
          message: `Course "${name}" not found`,
        });
      }

      courseCodes.push(course.courseCode);
    }

    teacher.coursename = courseNames;
    teacher.courseCode = courseCodes;

    await teacher.save();

    return res.status(200).json({
      status: true,
      message: "Teacher course information updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getTeacherProfile = async (req, res) => {
  try {
    const teacher = req.user;

    // ✅ Get course codes
    const courseCodes = teacher.courseCode
      ? (Array.isArray(teacher.courseCode)
          ? teacher.courseCode
          : [teacher.courseCode])
      : [];

    let studentCount = 0;

    // ✅ Calculate student count if courses exist
    if (courseCodes.length > 0) {
      const enrollments = await Enrollment.findAll({
        where: {
          courseCode: {
            [Op.in]: courseCodes,
          },
          teacherId: teacher.teacherId,
          status: "APPROVED",
        },
        attributes: ["studentId"],
      });

      const uniqueStudentIds = [
        ...new Set(enrollments.map((e) => e.studentId)),
      ];

      studentCount = uniqueStudentIds.length;
    }

    // ✅ Profile data
    const profileData = {
      // Identifiers / system
      teacherId: teacher.teacherId,
      userId: teacher.userId,
      role: teacher.role,
      status: teacher.status,
      isVerified: teacher.isVerified,
      rating: teacher.rating,
      studentCount,

      // Basic Details
      name: teacher.name,
      email: teacher.email,
      mobile: teacher.mobile,
      gender: teacher.gender,
      whatsappNumber: teacher.whatsappNumber,
      age: teacher.age,
      dateOfBirth: teacher.dateOfBirth,

      // Education Details
      qualification: teacher.qualification,
      specializations: teacher.specializations,

      // Professional Details
      totalTeachingExperience: teacher.totalTeachingExperience,
      relevantExperience: teacher.relevantExperience,
      subjectsCanTeach: teacher.subjectsCanTeach,
      classesCanTeach: teacher.classesCanTeach,
      preferredCurriculum: teacher.preferredCurriculum,
      languagesCanTeach: teacher.languagesCanTeach,

      // Online Teaching Details
      teachingMode: teacher.teachingMode,
      batchSize: teacher.batchSize,
      teachingPlatforms: teacher.teachingPlatforms,
      availability: teacher.availability,
      internetConnectivity: teacher.internetConnectivity,
      hasLaptopDesktop: teacher.hasLaptopDesktop,
      hasWebcam: teacher.hasWebcam,
      hasDigitalWritingPad: teacher.hasDigitalWritingPad,
      hasHeadset: teacher.hasHeadset,

      // Pricing Details
      individualClassFeesPerHour: teacher.individualClassFeesPerHour,
      batchClassFeesPerStudentMonth: teacher.batchClassFeesPerStudentMonth,
      preferredPaymentModes: teacher.preferredPaymentModes,

      // Location Preference
      preferredStudentLocation: teacher.preferredStudentLocation,

      // Location / Address
      address: teacher.address,
      country: teacher.country,
      lattitude: teacher.lattitude,
      longitude: teacher.longitude,

      // Courses assigned
      coursename: teacher.coursename,
      courseCode: teacher.courseCode,

      // Documents / media
      profileImage: teacher.profileImage,
      idProofDocument: teacher.idProofDocument,
      qualificationCertificates: teacher.qualificationCertificates,
      experienceCertificates: teacher.experienceCertificates,
    };


    return res.status(200).json({
      status: true,
      message: "Teacher profile fetched successfully",
      data: profileData,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getTeacherCourses = async (req, res) => {
  try {
    const teacher = req.user; // From auth middleware

    // Get course codes from teacher
    const courseCodes = teacher.courseCode
  ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
  : [];

    if (courseCodes.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No courses assigned to this teacher",
        data: [],
      });
    }

    // Fetch courses based on course codes
    const courses = await Course.findAll({
      where: {
        courseCode: {
          [Op.in]: courseCodes,
        },
      },
      attributes: ['courseCode', 'courseName', 'courseDescription', 'thumbnail', 'status', 'createdAt', 'courseType', 'rating', 'deadline', 'courseStartDate', 'courseDuration', 'totalenrollment'],
    });

    return res.status(200).json({
      status: true,
      message: "Teacher courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};



const getTeacherCourseStudents = async (req, res) => {
  try {
    const teacher = req.user; // From auth middleware
    const { courseCode } = req.params;

    // Validation
    if (!courseCode) {
      return res.status(400).json({
        success: false,
        message: "Course code is required",
      });
    }

    // Check if teacher is assigned to this course
    const teacherCourseCodes = teacher.courseCode
      ? (Array.isArray(teacher.courseCode)
          ? teacher.courseCode
          : [teacher.courseCode])
      : [];

    if (!teacherCourseCodes.includes(courseCode)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view students for this course",
      });
    }

    // Fetch enrollments (approved + teacher filter)
    const enrollments = await Enrollment.findAll({
      where: {
        courseCode,
        teacherId: teacher.teacherId, // using logged-in teacher
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

    // Make students distinct by studentId
    const uniqueStudentsMap = new Map();
    enrollments.forEach((enrollment) => {
      if (!uniqueStudentsMap.has(enrollment.studentId)) {
        uniqueStudentsMap.set(enrollment.studentId, enrollment);
      }
    });

    const uniqueStudents = Array.from(uniqueStudentsMap.values());

    return res.status(200).json({
      success: true,
      message: "Distinct students fetched successfully",
      data: uniqueStudents,
      studentCount: uniqueStudents.length,
    });
  } catch (error) {
    console.error("Get Teacher Course Students Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getTeacherLiveSessions = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status } = req.query;

    // Update session statuses based on current time
    const currentTime = new Date();

    // Update upcoming to ongoing
    await Livesession.update(
      { status: 'ongoing' },
      {
        where: {
          status: 'upcoming',
          startTime: {
            [Op.lte]: currentTime,
          },
        },
      }
    );

    // Update ongoing to completed
    await Livesession.update(
      { status: 'completed' },
      {
        where: {
          status: 'ongoing',
          endTime: {
            [Op.lt]: currentTime,
          },
        },
      }
    );

    const whereClause = { teacherId };

    // Filter by status if provided
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const liveSessions = await Livesession.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Live sessions fetched successfully",
      data: liveSessions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const courseCountForTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findOne({
      where: { teacherId },
      attributes: ['teacherId', 'name', 'coursename', 'courseCode'],
    });

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    const courseNames = teacher.coursename || [];
    const courseCodes = teacher.courseCode || [];
    const courseCount = Math.max(courseNames.length, courseCodes.length); // Use the longer array as count

    return res.status(200).json({
      status: true,
      message: "Course count for teacher fetched successfully",
      courseCount: courseCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getTotalStudentCountForTeacher = async (req, res) => {
  try {
    const teacher = req.user; // From auth middleware

    // Get course codes from teacher
    const courseCodes = teacher.courseCode
      ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
      : [];

    if (courseCodes.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No courses assigned to this teacher",
        studentCount: 0,
      });
    }

    // Fetch enrollments for the courses with approved status AND teacherId filter
    const enrollments = await Enrollment.findAll({
      where: {
        courseCode: {
          [Op.in]: courseCodes,
        },
        teacherId: teacher.teacherId, // Filter by teacherId to get only this teacher's students
        status: 'APPROVED',
      },
      attributes: ['studentId'],
    });

    // Get unique studentIds
    const uniqueStudentIds = [...new Set(enrollments.map(e => e.studentId))];
    const studentCount = uniqueStudentIds.length;

    return res.status(200).json({
      status: true,
      message: "Total student count fetched successfully",
      studentCount: studentCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTeacherProfile = async (req, res) => {
  try {
    const teacher = req.user;

    // ✅ Handle profile image (stored in dedicated /uploads/teacher-profiles/ directory)
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      teacher.profileImage = '/uploads/teacher-profiles/' + req.files.profileImage[0].filename;
    } else if (req.file) {
      teacher.profileImage = '/uploads/teacher-profiles/' + req.file.filename;
    }

    // ✅ Handle documents upload (optional)
    if (req.files) {
      const {
        idProofDocument,
        qualificationCertificates,
        experienceCertificates,
      } = req.files;

      if (idProofDocument && Array.isArray(idProofDocument) && idProofDocument[0]) {
        teacher.idProofDocument = '/uploads/teacher-documents/' + idProofDocument[0].filename;
      }

      if (qualificationCertificates && Array.isArray(qualificationCertificates)) {
        teacher.qualificationCertificates = qualificationCertificates.map(
          (f) => '/uploads/teacher-documents/' + f.filename
        );
      }

      if (experienceCertificates && Array.isArray(experienceCertificates)) {
        teacher.experienceCertificates = experienceCertificates.map(
          (f) => '/uploads/teacher-documents/' + f.filename
        );
      }
    }

    // ✅ Only these fields can be updated
    const allowedFields = [
      'name',
      'whatsappNumber',
      'age',
      'dateOfBirth',
      'qualification',
      'gender',
      'address',
      'country',
      'lattitude',
      'longitude',
      'specializations',
      'totalTeachingExperience',
      'relevantExperience',
      'subjectsCanTeach',
      'classesCanTeach',
      'preferredCurriculum',
      'languagesCanTeach',
      'teachingMode',
      'batchSize',
      'teachingPlatforms',
      'availability',
      'internetConnectivity',
      'hasLaptopDesktop',
      'hasWebcam',
      'hasDigitalWritingPad',
      'hasHeadset',
      'individualClassFeesPerHour',
      'batchClassFeesPerStudentMonth',
      'preferredPaymentModes',
      'preferredStudentLocation',
      'idProofDocument',
      'qualificationCertificates',
      'experienceCertificates'
    ];

    const numberFields = new Set([
      'age',
      'totalTeachingExperience',
      'relevantExperience',
      'subjectsCanTeach',
      'classesCanTeach',
      'batchSize',
      'individualClassFeesPerHour',
      'batchClassFeesPerStudentMonth',
    ]);

    const booleanFields = new Set([
      'hasLaptopDesktop',
      'hasWebcam',
      'hasDigitalWritingPad',
      'hasHeadset',
    ]);

    for (const field of allowedFields) {
      if (!(field in req.body)) continue;

      let value = req.body[field];

      if (value === undefined || value === null) continue;
      if (typeof value === 'string' && value.trim() === '') continue;

      if (numberFields.has(field)) {
        const num = Number(value);
        if (Number.isNaN(num)) continue;
        teacher[field] = num;
        continue;
      }

      if (booleanFields.has(field)) {
        if (value === true || value === false) {
          teacher[field] = value;
          continue;
        }
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true') { teacher[field] = true; continue; }
          if (lower === 'false') { teacher[field] = false; continue; }
        }
        continue;
      }

      teacher[field] = value;
    }

    // ✅ Save changes
    await teacher.save();

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: teacher,
    });

  } catch (error) {
    console.error("Update Teacher Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: "teacherId is required",
      });
    }

    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    // ✅ Soft delete - set TERMINATED status
    teacher.status = "TERMINATED";

    await teacher.save();

    return res.status(200).json({
      status: true,
      message: "Your Classplus account has been successfully deleted because of user request.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export { getAllTeachers, updateTeacherStatus, getTeacherCount, updateCoursename, getTeacherProfile, getTeacherCourses, getTeacherCourseStudents, getTeacherLiveSessions, courseCountForTeacher, getTotalStudentCountForTeacher, updateTeacherProfile, deleteTeacher };
