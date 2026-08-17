import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import { getAdminTeacherReport } from './adminReport.controller.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/:teacherId', getAdminTeacherReport);

export default router;
