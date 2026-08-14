import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';
import {
  getClassSummary,
  getClassHierarchyById,
  getSubjectCourses,
  getCourseParticipantsByCode,
  patchCourseDetails,
} from '../controllers/adminCatalogController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/classes', getClassSummary);
router.get('/classes/:id/hierarchy', getClassHierarchyById);
router.get('/subjects/:subjectCode/courses', getSubjectCourses);
router.get('/courses/:courseCode/participants', getCourseParticipantsByCode);
router.patch('/courses/:courseCode', patchCourseDetails);

export default router;
