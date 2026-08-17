/**
 * Admin Classes Service
 * Database operations for admin class management
 */

import { Op } from 'sequelize';
import Class from '../../models/Class.js';
import Course from '../../models/Course.js';
import Subject from '../../models/Subject.js';
import Enrollment from '../../models/Enrollment.js';

/**
 * Get statistics for all classes
 * Aggregates subject, course, and enrollment data
 */
export const getClassStatsService = async () => {
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

/**
 * Get detailed hierarchy for a specific class
 * Returns subjects and courses under the class
 */
export const getClassHierarchyService = async (classId) => {
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
