import Assignment from '../../../models/Assignment.js';
import AssignmentSubmission from '../../../models/AssignmentSubmission.js';
import { getPaginatedData } from '../../../utils/pagination.js';

export const createAssignmentService = async (assignmentData) => {
  return await Assignment.create(assignmentData);
};

export const getTeacherAssignmentsService = async (whereClause, page, limit) => {
  const queryOptions = {
    where: whereClause,
    order: [['createdAt', 'DESC']],
  };

  if (page || limit) {
    return await getPaginatedData(Assignment, queryOptions, page || 1, limit || 10);
  }

  return await Assignment.findAll(queryOptions);
};

export const getTeacherAssignmentSubmissionsService = async (whereClause) => {
  return await AssignmentSubmission.findAll({
    where: whereClause,
    include: [{ model: Assignment }],
    order: [['createdAt', 'DESC']],
  });
};
