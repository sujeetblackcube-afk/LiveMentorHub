import Tests from '../../../models/Test.js';
import TestSubmissions from '../../../models/TestSubmission.js';
import Course from '../../../models/Course.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const fetchAllTestsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page, limit } = req.query;

    const queryOptions = {
      where: { isPublished: true },
      include: [{ model: Course, as: 'course', attributes: ['courseCode', 'courseName'] }],
      order: [['createdAt', 'DESC']],
    };

    if (page || limit) {
      const paginatedResult = await getPaginatedData(Tests, queryOptions, page || 1, limit || 10);
      return res.status(200).json({
        success: true,
        tests: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const tests = await Tests.findAll(queryOptions);
    return res.status(200).json({ success: true, tests });
  } catch (error) {
    console.error('Error fetching student tests:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitTestByStudent = async (req, res) => {
  try {
    const { testId, studentId, answers, attemptNumber } = req.body;

    if (!testId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: testId, studentId',
      });
    }

    const test = await Tests.findByPk(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const submission = await TestSubmissions.create({
      testId,
      studentId,
      teacherId: test.teacherId,
      courseCode: test.courseCode,
      attemptNumber: attemptNumber || 1,
      answers: answers || [],
      status: 'SUBMITTED',
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      submission,
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
