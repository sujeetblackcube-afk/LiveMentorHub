/**
 * Teacher tests controller.
 * Internal refactor only; public endpoints remain under /api/tests.
 */

import {
  createTeacherTestService,
  getTeacherTestsService,
  getTeacherTestByIdService,
  updateTeacherTestService,
  deleteTeacherTestService,
  getTeacherTestSubmissionsService,
  updateTeacherTestSubmissionMarksService,
} from './teacherTest.service.js';

export const createTeacherTest = async (req, res) => {
  try {
    const data = await createTeacherTestService(req.body);
    return res.status(201).json({ success: true, message: 'Test created successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to create test' });
  }
};

export const getTeacherTests = async (req, res) => {
  try {
    const data = await getTeacherTestsService(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to fetch tests' });
  }
};

export const getTeacherTestById = async (req, res) => {
  try {
    const data = await getTeacherTestByIdService(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to fetch test' });
  }
};

export const updateTeacherTest = async (req, res) => {
  try {
    const data = await updateTeacherTestService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Test updated successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to update test' });
  }
};

export const deleteTeacherTest = async (req, res) => {
  try {
    const data = await deleteTeacherTestService(req.params.id);
    return res.status(200).json({ success: true, message: 'Test deleted successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to delete test' });
  }
};

export const getTeacherTestSubmissions = async (req, res) => {
  try {
    const data = await getTeacherTestSubmissionsService(req.params.teacherId, req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to fetch test submissions' });
  }
};

export const updateTeacherTestSubmissionMarks = async (req, res) => {
  try {
    const data = await updateTeacherTestSubmissionMarksService(req.params.submissionId, req.body);
    return res.status(200).json({ success: true, message: 'Submission updated successfully', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to update submission' });
  }
};
