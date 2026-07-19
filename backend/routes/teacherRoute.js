import express from 'express';
import multer from 'multer';
import { getAllTeachers, updateTeacherStatus, getTeacherCount, updateCoursename, getTeacherProfile, getTeacherCourses, getTeacherCourseStudents,getTeacherLiveSessions, courseCountForTeacher, getTotalStudentCountForTeacher ,updateTeacherProfile,deleteTeacher} from '../controllers/teacherController.js';
import authMiddleware from '../middleware/authmiddleware.js';

import fs from 'fs';
import path from 'path';

// Ensure dedicated directory exists for teacher profiles and documents
const teacherProfileDir = path.join(process.cwd(), 'uploads', 'teacher-profiles');
const teacherDocDir = path.join(process.cwd(), 'uploads', 'teacher-documents');
if (!fs.existsSync(teacherProfileDir)) fs.mkdirSync(teacherProfileDir, { recursive: true });
if (!fs.existsSync(teacherDocDir)) fs.mkdirSync(teacherDocDir, { recursive: true });

// Configure multer for profile image and document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, 'uploads/teacher-profiles/');
    } else {
      cb(null, 'uploads/teacher-documents/');
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `teacher-${file.fieldname}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

// Get all teachers
router.get('/', getAllTeachers);

// Get teacher count
router.get('/count', getTeacherCount);

// Update teacher status
router.patch('/:teacherId/status', updateTeacherStatus);

// Update teacher course information
router.patch('/:teacherId/course', updateCoursename);

// Get teacher profile
router.get('/profile', authMiddleware, getTeacherProfile);

// Update teacher profile
// Uses multer fields so controller can access req.files for documents.
router.put(
  '/profile',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'idProofDocument', maxCount: 1 },
    { name: 'qualificationCertificates', maxCount: 20 },
    { name: 'experienceCertificates', maxCount: 20 },
  ]),
  authMiddleware,
  updateTeacherProfile
);


// Get teacher courses
router.get('/courses', authMiddleware, getTeacherCourses);

// Get students for a specific course
router.get('/courses/:courseCode/students', authMiddleware, getTeacherCourseStudents);

// get live sessions for a specific teacher
router.get('/:teacherId/livesessions', authMiddleware, getTeacherLiveSessions);

// get course count for a specific teacher
router.get('/:teacherId/coursecount', authMiddleware, courseCountForTeacher);

// get total student count for a teacher
router.get('/total-students', authMiddleware, getTotalStudentCountForTeacher);

// terminate teacher account
router.delete("/delete-account/:teacherId", deleteTeacher);

export default router;
