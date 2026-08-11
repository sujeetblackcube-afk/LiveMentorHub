import express from 'express';
import { submitReview, getAverageRating } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/authmiddleware.js';
import {hasStudentReviewed} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', authMiddleware, submitReview);

router.get('/average', authMiddleware, getAverageRating);

router.get('/has-reviewed', hasStudentReviewed);

export default router;
