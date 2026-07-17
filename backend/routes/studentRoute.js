import express from 'express';
import { getAllStudents, updateStudentStatus, getStudentById, updateStudentData, getStudentCount, getStudentLiveSessions, getStudentProgress,deleteStudent } from '../controllers/studentController.js';
import { uploadProfile } from '../controllers/studentController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Get all students
router.get('/', getAllStudents);

// Get student count
router.get('/count', getStudentCount);

// Get student by ID
router.get('/:studentId', getStudentById);

// Get student progress (assignments + tests)
router.get('/:studentId/progress', getStudentProgress);

// Update student status
router.patch('/:studentId/status', updateStudentStatus);

// Update student data
router.put('/:studentId', uploadProfile.single('profileImage'), updateStudentData);

// Get live sessions for the authenticated student
router.get('/getlive-sessions/:studentId', authMiddleware, getStudentLiveSessions);

// terminate student
router.delete("/delete-account/:studentId", deleteStudent);

export default router;
