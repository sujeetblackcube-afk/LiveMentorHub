import express from 'express';
import { submitReview, getAverageRating, hasStudentReviewed } from '../../../modules/student/reviews/studentReview.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, submitReview);

router.get('/average', getAverageRating);

router.get('/has-reviewed', hasStudentReviewed);
router.post('/has-reviewed', hasStudentReviewed);

export default router;
