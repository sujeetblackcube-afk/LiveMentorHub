import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  addTeacherAssignment,
  getTeacherAssignments,
  getTeacherAssignmentById,
  editTeacherAssignment,
  deleteTeacherAssignment,
  submitTeacherAssignment,
  uploadTeacherAssignmentFile,
  getStudentTeacherAssignments,
  getTeacherAssignmentOfStudentByTeacher,
  checkTeacherAssignmentByTeacher,
} from './teacherAssignment.controller.js';

const router = express.Router();

const requireTeacherRole = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required',
    });
  }

  next();
};

router.use(authMiddleware);
router.use(requireTeacherRole);

router.post('/:teacherId', uploadTeacherAssignmentFile, addTeacherAssignment);
router.post('/students/submission', uploadTeacherAssignmentFile, submitTeacherAssignment);
router.get('/', getTeacherAssignments);
router.get('/:id', getTeacherAssignmentById);
router.put('/:id', editTeacherAssignment);
router.delete('/:id', deleteTeacherAssignment);
router.get('/student/:studentId', getStudentTeacherAssignments);
router.get('/teacher/:teacherId', getTeacherAssignmentOfStudentByTeacher);
router.put('/teacher/submission/:submissionId', checkTeacherAssignmentByTeacher);

export default router;
