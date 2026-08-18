import Test from '../../../models/Test.js';
import TestSubmission from '../../../models/TestSubmission.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const createTeacherTestService = async (payload) => {
  return payload;
};

export const getTeacherTestsService = async (query) => {
  const { teacherId, courseCode, isPublished, page, limit } = query;
  const whereClause = {};

  if (teacherId) whereClause.teacherId = teacherId;
  if (courseCode) whereClause.courseCode = courseCode;
  if (isPublished !== undefined) whereClause.isPublished = isPublished === 'true';

  const queryOptions = {
    where: whereClause,
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    const paginatedResult = await getPaginatedData(Test, queryOptions, Number(page || 1), Number(limit || 10));
    return {
      success: true,
      count: paginatedResult.totalItems,
      tests: paginatedResult.data,
      pagination: {
        totalItems: paginatedResult.totalItems,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage,
        limit: paginatedResult.limit,
      },
    };
  }

  const tests = await Test.findAll(queryOptions);
  return {
    success: true,
    count: tests.length,
    tests,
  };
};

export const getTeacherTestByIdService = async (id) => {
  const test = await Test.findByPk(id);
  if (!test) {
    const error = new Error('Test not found');
    error.statusCode = 404;
    throw error;
  }
  return test;
};

export const updateTeacherTestService = async (id, payload) => {
  const test = await Test.findByPk(id);
  if (!test) {
    const error = new Error('Test not found');
    error.statusCode = 404;
    throw error;
  }
  Object.assign(test, payload);
  await test.save();
  return test;
};

export const deleteTeacherTestService = async (id) => {
  const test = await Test.findByPk(id);
  if (!test) {
    const error = new Error('Test not found');
    error.statusCode = 404;
    throw error;
  }
  await test.destroy();
  return { id };
};

export const getTeacherTestSubmissionsService = async (teacherId, query) => {
  const { page, limit } = query;
  const queryOptions = {
    where: { teacherId },
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    const paginatedResult = await getPaginatedData(TestSubmission, queryOptions, Number(page || 1), Number(limit || 10));
    return {
      success: true,
      data: paginatedResult.data,
      pagination: {
        totalItems: paginatedResult.totalItems,
        totalPages: paginatedResult.totalPages,
        currentPage: paginatedResult.currentPage,
        limit: paginatedResult.limit,
      },
    };
  }

  const submissions = await TestSubmission.findAll(queryOptions);
  return { success: true, data: submissions };
};

export const updateTeacherTestSubmissionMarksService = async (submissionId, payload) => {
  const submission = await TestSubmission.findByPk(submissionId);
  if (!submission) {
    const error = new Error('Submission not found');
    error.statusCode = 404;
    throw error;
  }
  Object.assign(submission, payload);
  await submission.save();
  return submission;
};
