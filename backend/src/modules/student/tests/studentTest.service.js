import Tests from '../../../models/Test.js';
import TestSubmissions from '../../../models/TestSubmission.js';
import Course from '../../../models/Course.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const getStudentTestsService = async (page, limit) => {
  const queryOptions = {
    where: { isPublished: true },
    include: [{ model: Course, as: 'course', attributes: ['courseCode', 'courseName'] }],
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    return await getPaginatedData(Tests, queryOptions, page || 1, limit || 10);
  }

  return await Tests.findAll(queryOptions);
};

export const submitStudentTestService = async (submissionData) => {
  return await TestSubmissions.create(submissionData);
};
