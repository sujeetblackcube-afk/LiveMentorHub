import {
  addAssignment,
  getAssignments,
  getAssignmentById,
  editAssignment,
  deleteAssignment,
  submitAssignment,
  uploadAssignmentFile,
  getStudentAssignments,
  getAssignmentOfStudentByTeacher,
  checkAssignmentByTeacher,
} from './assignmentLegacy.controller.js';

export const addTeacherAssignment = addAssignment;
export const getTeacherAssignments = getAssignments;
export const getTeacherAssignmentById = getAssignmentById;
export const editTeacherAssignment = editAssignment;
export const deleteTeacherAssignment = deleteAssignment;
export const submitTeacherAssignment = submitAssignment;
export const uploadTeacherAssignmentFile = uploadAssignmentFile;
export const getStudentTeacherAssignments = getStudentAssignments;
export const getTeacherAssignmentOfStudentByTeacher = getAssignmentOfStudentByTeacher;
export const checkTeacherAssignmentByTeacher = checkAssignmentByTeacher;

export {
  addAssignment,
  getAssignments,
  getAssignmentById,
  editAssignment,
  deleteAssignment,
  submitAssignment,
  uploadAssignmentFile,
  getStudentAssignments,
  getAssignmentOfStudentByTeacher,
  checkAssignmentByTeacher,
};
