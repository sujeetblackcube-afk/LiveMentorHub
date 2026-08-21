import Doubt from '../../../models/Doubt.js';
import Course from '../../../models/Course.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const createStudentDoubtService = async (doubtData) => {
  return await Doubt.create(doubtData);
};

export const getStudentDoubtsService = async (studentId, courseCode, page, limit) => {
  const whereClause = { studentId };
  if (courseCode) whereClause.courseCode = courseCode;

  const queryOptions = {
    where: whereClause,
    include: [{ model: Course, attributes: ['courseCode', 'courseName'] }],
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    return await getPaginatedData(Doubt, queryOptions, page || 1, limit || 10);
  }

  return await Doubt.findAll(queryOptions);
};
