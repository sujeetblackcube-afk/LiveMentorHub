import express from "express";
import multer from "multer";
import { getProfile, updateProfile } from "../controllers/superAdminController.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile);

export default router;
