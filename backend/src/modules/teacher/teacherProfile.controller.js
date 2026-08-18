import Teacher from '../../models/Teacher.js';
import Course from '../../models/Course.js';
import Enrollment from '../../models/Enrollment.js';
import Livesession from '../../models/Livesession.js';
import pkg from 'sequelize';
const { Op } = pkg;
import { getPaginatedData } from '../../utils/pagination.js';

// Get all teachers (with optional pagination and name search)
export const getAllTeachers = async (req, res) => {
  try {
    const { status, startDate, endDate, page, limit, search } = req.query;
    const whereClause = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

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
        exclude: ['passwordHash', 'otp', 'otpExpiresAt', 'playerId', 'userId'],
      },
      order: [['createdAt', 'DESC']],
    };

    if (page) {
      const paginatedResult = await getPaginatedData(Teacher, queryOptions, page, limit || 10);
      return res.status(200).json({
        status: true,
        message: 'Teachers fetched successfully',
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
      message: 'Teachers fetched successfully',
      data: teachers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateTeacherStatus = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status } = req.body;
    const allowedStatus = ['PENDING', 'APPROVED', 'SUSPENDED', 'TERMINATED'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid status value',
      });
    }

    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: 'Teacher not found',
      });
    }

    teacher.status = status;
    await teacher.save();

    return res.status(200).json({
      status: true,
      message: 'Teacher status updated successfully',
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getTeacherCount = async (req, res) => {
  try {
    const count = await Teacher.count();
    return res.status(200).json({
      status: true,
      message: 'Teacher count fetched successfully',
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateCoursename = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { coursename } = req.body;

    if (!coursename || (Array.isArray(coursename) && coursename.length === 0)) {
      return res.status(400).json({
        status: false,
        message: 'Coursename is required',
      });
    }

    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: 'Teacher not found',
      });
    }

    const courseNames = Array.isArray(coursename) ? coursename : [coursename];
    const courseCodes = [];

    for (const name of courseNames) {
      const course = await Course.findOne({
        where: { courseName: name },
        attributes: ['courseCode'],
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
      message: 'Teacher course information updated successfully',
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getTeacherProfile = async (req, res) => {
  try {
    let teacher = req.user;
    if (!teacher && req.auth) {
      const { specificId, userId } = req.auth;
      teacher = (specificId ? await Teacher.findOne({ where: { teacherId: specificId } }) : null) ||
                (userId ? await Teacher.findOne({ where: { userId } }) : null);
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        status: false,
        message: 'Teacher profile not found',
      });
    }

    const courseCodes = teacher.courseCode
      ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
      : [];

    let studentCount = 0;
    if (courseCodes.length > 0) {
      const enrollments = await Enrollment.findAll({
        where: {
          courseCode: {
            [Op.in]: courseCodes,
          },
          teacherId: teacher.teacherId,
          status: 'APPROVED',
        },
        attributes: ['studentId'],
      });

      const uniqueStudentIds = [...new Set(enrollments.map((e) => e.studentId))];
      studentCount = uniqueStudentIds.length;
    }

    const profileData = {
      teacherId: teacher.teacherId,
      userId: teacher.userId,
      role: teacher.role,
      status: teacher.status,
      isVerified: teacher.isVerified,
      rating: teacher.rating,
      studentCount,
      name: teacher.name,
      email: teacher.email,
      mobile: teacher.mobile,
      gender: teacher.gender,
      whatsappNumber: teacher.whatsappNumber,
      age: teacher.age,
      dateOfBirth: teacher.dateOfBirth,
      qualification: teacher.qualification,
      specializations: teacher.specializations,
      totalTeachingExperience: teacher.totalTeachingExperience,
      relevantExperience: teacher.relevantExperience,
      subjectsCanTeach: teacher.subjectsCanTeach,
      classesCanTeach: teacher.classesCanTeach,
      preferredCurriculum: teacher.preferredCurriculum,
      languagesCanTeach: teacher.languagesCanTeach,
      teachingMode: teacher.teachingMode,
      batchSize: teacher.batchSize,
      teachingPlatforms: teacher.teachingPlatforms,
      availability: teacher.availability,
      internetConnectivity: teacher.internetConnectivity,
      hasLaptopDesktop: teacher.hasLaptopDesktop,
      hasWebcam: teacher.hasWebcam,
      hasDigitalWritingPad: teacher.hasDigitalWritingPad,
      hasHeadset: teacher.hasHeadset,
      individualClassFeesPerHour: teacher.individualClassFeesPerHour,
      batchClassFeesPerStudentMonth: teacher.batchClassFeesPerStudentMonth,
      preferredPaymentModes: teacher.preferredPaymentModes,
      preferredStudentLocation: teacher.preferredStudentLocation,
      address: teacher.address,
      country: teacher.country,
      lattitude: teacher.lattitude,
      longitude: teacher.longitude,
      coursename: teacher.coursename,
      courseCode: teacher.courseCode,
      profileImage: teacher.profileImage,
      idProofDocument: teacher.idProofDocument,
      qualificationCertificates: teacher.qualificationCertificates,
      experienceCertificates: teacher.experienceCertificates,
    };

    return res.status(200).json({
      status: true,
      message: 'Teacher profile fetched successfully',
      data: profileData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getTeacherCourses = async (req, res) => {
  try {
    const teacher = req.user;
    const { page, limit } = req.query;
    const courseCodes = teacher.courseCode
      ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
      : [];

    if (courseCodes.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'No courses assigned to this teacher',
        data: [],
      });
    }

    const queryOptions = {
      where: {
        courseCode: {
          [Op.in]: courseCodes,
        },
      },
      attributes: ['courseCode', 'courseName', 'courseDescription', 'thumbnail', 'status', 'createdAt', 'courseType', 'rating', 'deadline', 'courseStartDate', 'courseDuration', 'totalenrollment'],
      order: [['createdAt', 'DESC']],
    };

    if (page || limit) {
      const paginatedResult = await getPaginatedData(Course, queryOptions, page || 1, limit || 10);
      return res.status(200).json({
        status: true,
        message: 'Teacher courses fetched successfully',
        data: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const courses = await Course.findAll(queryOptions);
    return res.status(200).json({
      status: true,
      message: 'Teacher courses fetched successfully',
      data: courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getTeacherCourseStudents = async (req, res) => {
  try {
    const teacher = req.user;
    const { courseCode } = req.params;

    if (!courseCode) {
      return res.status(400).json({
        success: false,
        message: 'Course code is required',
      });
    }

    const teacherCourseCodes = teacher.courseCode
      ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
      : [];

    if (!teacherCourseCodes.includes(courseCode)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view students for this course',
      });
    }

    const { page, limit } = req.query;
    const queryOptions = {
      where: {
        courseCode,
        teacherId: teacher.teacherId,
        status: 'APPROVED',
      },
      attributes: [
        'studentId',
        'studentName',
        'studentEmail',
        'studentMobile',
        'studentAddress',
        'courseName',
        'courseCode',
        'teacherId',
        'status',
        'paymentStatus',
        'enrollmentCode',
        'enrollmentDate',
      ],
      order: [['createdAt', 'DESC']],
    };

    if (page || limit) {
      const paginatedResult = await getPaginatedData(Enrollment, queryOptions, page || 1, limit || 10);
      return res.status(200).json({
        success: true,
        message: 'Distinct students fetched successfully',
        data: paginatedResult.data,
        studentCount: paginatedResult.totalItems,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const enrollments = await Enrollment.findAll(queryOptions);
    const uniqueStudentsMap = new Map();
    enrollments.forEach((enrollment) => {
      if (!uniqueStudentsMap.has(enrollment.studentId)) {
        uniqueStudentsMap.set(enrollment.studentId, enrollment);
      }
    });

    const uniqueStudents = Array.from(uniqueStudentsMap.values());
    return res.status(200).json({
      success: true,
      message: 'Distinct students fetched successfully',
      data: uniqueStudents,
      studentCount: uniqueStudents.length,
    });
  } catch (error) {
    console.error('Get Teacher Course Students Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getTeacherLiveSessions = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status, page, limit } = req.query;
    const currentTime = new Date();

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
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const queryOptions = {
      where: whereClause,
      order: [['createdAt', 'DESC']],
    };

    if (page || limit) {
      const paginatedResult = await getPaginatedData(Livesession, queryOptions, page || 1, limit || 10);
      return res.status(200).json({
        status: true,
        message: 'Live sessions fetched successfully',
        data: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const liveSessions = await Livesession.findAll(queryOptions);
    return res.status(200).json({
      status: true,
      message: 'Live sessions fetched successfully',
      data: liveSessions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const courseCountForTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findOne({
      where: { teacherId },
      attributes: ['teacherId', 'name', 'coursename', 'courseCode'],
    });

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: 'Teacher not found',
      });
    }

    const courseNames = teacher.coursename || [];
    const courseCodes = teacher.courseCode || [];
    const courseCount = Math.max(courseNames.length, courseCodes.length);

    return res.status(200).json({
      status: true,
      message: 'Course count for teacher fetched successfully',
      courseCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getTotalStudentCountForTeacher = async (req, res) => {
  try {
    const teacher = req.user;
    const courseCodes = teacher.courseCode
      ? (Array.isArray(teacher.courseCode) ? teacher.courseCode : [teacher.courseCode])
      : [];

    if (courseCodes.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'No courses assigned to this teacher',
        studentCount: 0,
      });
    }

    const enrollments = await Enrollment.findAll({
      where: {
        courseCode: {
          [Op.in]: courseCodes,
        },
        teacherId: teacher.teacherId,
        status: 'APPROVED',
      },
      attributes: ['studentId'],
    });

    const uniqueStudentIds = [...new Set(enrollments.map((e) => e.studentId))];
    const studentCount = uniqueStudentIds.length;

    return res.status(200).json({
      status: true,
      message: 'Total student count fetched successfully',
      studentCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateTeacherProfile = async (req, res) => {
  try {
    let teacher = req.user;
    if (!teacher && req.auth) {
      const { specificId, userId } = req.auth;
      teacher = (specificId ? await Teacher.findOne({ where: { teacherId: specificId } }) : null) ||
                (userId ? await Teacher.findOne({ where: { userId } }) : null);
    }

    if (!teacher) {
      return res.status(404).json({
        success: false,
        status: false,
        message: 'Teacher profile not found',
      });
    }

    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      teacher.profileImage = '/uploads/teacher-profiles/' + req.files.profileImage[0].filename;
    } else if (req.file) {
      teacher.profileImage = '/uploads/teacher-profiles/' + req.file.filename;
    }

    if (req.files) {
      const { idProofDocument, qualificationCertificates, experienceCertificates } = req.files;

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
      'experienceCertificates',
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

    await teacher.save();

    return res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      data: teacher,
    });
  } catch (error) {
    console.error('Update Teacher Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: 'teacherId is required',
      });
    }

    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: 'Teacher not found',
      });
    }

    teacher.status = 'TERMINATED';
    await teacher.save();

    return res.status(200).json({
      status: true,
      message: 'Your Classplus account has been successfully deleted because of user request.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
