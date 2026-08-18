import pkg from 'sequelize';
const { Op } = pkg;
import Class from '../models/Class.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import Enrollment from '../models/Enrollment.js';
import Teacher from '../models/Teacher.js';

const parseJsonList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return String(value)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
};

export const getClassStats = async () => {
  const classes = await Class.findAll({
    order: [['createdAt', 'DESC']],
  });

  const subjects = await Subject.findAll({
    attributes: ['subjectCode', 'subjectName', 'ForClass'],
    raw: true,
  });

  const courses = await Course.findAll({
    attributes: ['courseCode', 'classname', 'totalenrollment'],
    raw: true,
  });

  const courseCodes = courses.map((course) => course.courseCode);
  const enrollmentRows = courseCodes.length
    ? await Enrollment.findAll({
        where: { courseCode: { [Op.in]: courseCodes } },
        attributes: ['studentId', 'courseCode'],
        raw: true,
      })
    : [];

  const enrolledStudentsByCourse = new Map();
  for (const row of enrollmentRows) {
    const set = enrolledStudentsByCourse.get(row.courseCode) || new Set();
    set.add(row.studentId);
    enrolledStudentsByCourse.set(row.courseCode, set);
  }

  return classes.map((courseClass) => {
    const className = courseClass.className;
    const classSubjects = subjects.filter((subject) => subject.ForClass === className);
    const classCourses = courses.filter((course) => course.classname === className);
    const totalEnrolledStudents = new Set(
      classCourses.flatMap((course) => {
        const enrolled = enrolledStudentsByCourse.get(course.courseCode) || new Set();
        return [...enrolled];
      })
    ).size;

    return {
      classId: courseClass.id,
      className,
      status: courseClass.status,
      totalSubjects: classSubjects.length,
      totalCourses: classCourses.length,
      totalEnrolledStudents,
    };
  });
};

export const getClassHierarchy = async (classId) => {
  const courseClass = await Class.findByPk(classId);

  if (!courseClass) {
    const error = new Error('Class not found');
    error.statusCode = 404;
    throw error;
  }

  const subjects = await Subject.findAll({
    where: { ForClass: courseClass.className },
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  const subjectHierarchy = await Promise.all(
    subjects.map(async (subject) => {
      const courses = await Course.findAll({
        where: {
          classname: courseClass.className,
          subjectCode: subject.subjectCode,
        },
        order: [['courseCode', 'ASC']],
        raw: true,
      });

      const courseRows = await Promise.all(
        courses.map(async (course) => {
          const enrolledStudentCount = await Enrollment.count({
            where: {
              courseCode: course.courseCode,
            },
          });

          return {
            courseCode: course.courseCode,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            difficulty: course.difficulty,
            status: course.status,
            mrp: course.mrp,
            discountedprice: course.discountedprice,
            enrolledStudentCount,
          };
        })
      );

      return {
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        description: subject.description,
        language: subject.language,
        status: subject.status,
        courses: courseRows,
      };
    })
  );

  return {
    classId: courseClass.id,
    className: courseClass.className,
    status: courseClass.status,
    subjects: subjectHierarchy,
  };
};

export const getCoursesBySubjectCode = async (subjectCode) => {
  const subject = await Subject.findByPk(subjectCode);

  if (!subject) {
    const error = new Error('Subject not found');
    error.statusCode = 404;
    throw error;
  }

  const courses = await Course.findAll({
    where: { subjectCode },
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  return courses.map((course) => ({
    courseCode: course.courseCode,
    courseName: course.courseName,
    courseDescription: course.courseDescription,
    courseType: course.courseType,
    difficulty: course.difficulty,
    mrp: course.mrp,
    discountedprice: course.discountedprice,
    status: course.status,
    totalenrollment: course.totalenrollment,
    classname: course.classname,
    subject: course.subject,
    subjectCode: course.subjectCode,
    thumbnail: course.thumbnail,
    introVideo: course.introVideo,
    totalReviews: course.totalReviews,
    rating: course.rating,
    courseStartDate: course.courseStartDate,
    deadline: course.deadline,
  }));
};

export const getCourseParticipants = async (courseCode) => {
  const course = await Course.findByPk(courseCode);

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const teacherRows = await Teacher.findAll({ raw: true });
  const teachers = teacherRows
    .filter((teacher) => {
      const assignedCourseCodes = parseJsonList(teacher.courseCode);
      return assignedCourseCodes.includes(courseCode);
    })
    .map((teacher) => ({
      teacherId: teacher.teacherId,
      name: teacher.name,
      email: teacher.email,
      mobile: teacher.mobile,
      whatsappNumber: teacher.whatsappNumber,
      status: teacher.status,
    }));

  const studentRows = await Enrollment.findAll({
    where: { courseCode },
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  const students = studentRows.map((student) => ({
    studentId: student.studentId,
    name: student.studentName,
    email: student.studentEmail,
    progressPercentage: student.progress ?? 0,
    paymentStatus: student.paymentStatus,
    status: student.status,
  }));

  return {
    teachers,
    students,
  };
};

export const updateCourseDetails = async (courseCode, payload = {}) => {
  const course = await Course.findByPk(courseCode);

  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }

  const forbiddenKeys = new Set(['courseCode', 'id', 'rating', 'totalReviews', 'createdAt', 'updatedAt']);
  const allowedFields = [
    'courseName',
    'courseDescription',
    'courseType',
    'difficulty',
    'mrp',
    'discountedprice',
    'status',
    'deadline',
    'courseStartDate',
    'courseDuration',
    'board',
    'medium',
    'classname',
    'subject',
    'stream',
    'category',
    'subcategory',
    'targetAudience',
    'totalLessons',
    'thumbnail',
    'introVideo',
  ];

  for (const [field, value] of Object.entries(payload)) {
    if (forbiddenKeys.has(field)) continue;
    if (!allowedFields.includes(field)) continue;

    course[field] = value;
  }

  if (payload.subject !== undefined || payload.classname !== undefined) {
    const nextClassName = payload.classname ?? course.classname;
    const nextSubjectName = payload.subject ?? course.subject;

    if (nextClassName && nextSubjectName) {
      const match = await Subject.findOne({
        where: { subjectName: nextSubjectName, ForClass: nextClassName, status: 'ACTIVE' },
        attributes: ['subjectCode'],
        raw: true,
      });

      course.subjectCode = match ? match.subjectCode : null;
    }
  }

  await course.save();

  const normalizedCourse = course.toJSON();
  if (normalizedCourse.mrp !== null && normalizedCourse.mrp !== undefined) {
    normalizedCourse.mrp = Number(normalizedCourse.mrp).toFixed(2);
  }
  if (normalizedCourse.discountedprice !== null && normalizedCourse.discountedprice !== undefined) {
    normalizedCourse.discountedprice = Number(normalizedCourse.discountedprice).toFixed(2);
  }

  return normalizedCourse;
};
