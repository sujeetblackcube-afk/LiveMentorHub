import Enrollment from '../../../models/Enrollment.js';
import Course from '../../../models/Course.js';

export const getStudentEnrollmentsService = async (studentId) => {
  return await Enrollment.findAll({
    where: { studentId },
    include: [{ model: Course, attributes: ['courseCode', 'courseName', 'thumbnail'] }],
    order: [['createdAt', 'DESC']],
  });
};

export const createStudentEnrollmentService = async (data) => {
  return await Enrollment.create(data);
};
