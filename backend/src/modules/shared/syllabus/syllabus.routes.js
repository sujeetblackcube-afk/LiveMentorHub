import express from 'express';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  addUpdateSyllabus,
  getSyllabus,
  addBulletPoints,
  updateBulletPoints,
  uploadSyllabusFile
} from '../../../modules/shared/syllabus/syllabus.controller.js';

const router = express.Router();

// ✅ Public route (NO TOKEN)
router.get('/:courseCode', getSyllabus);

// 🔒 Protected routes (TOKEN REQUIRED)
router.post('/', authMiddleware, uploadSyllabusFile, addUpdateSyllabus);
router.post('/:courseCode/bullet-points', authMiddleware, addBulletPoints);
router.put('/:courseCode/bullet-points', authMiddleware, updateBulletPoints);

export default router;
