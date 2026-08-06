import express from "express";
import multer from "multer";
import { getProfile, updateProfile } from "../controllers/superAdminController.js";
import { adminGetAllReviews, adminDeleteReview} from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile);

router.get('/reviews', authMiddleware, adminGetAllReviews);

router.delete('/reviews/:reviewId', authMiddleware, adminDeleteReview);
export default router;
