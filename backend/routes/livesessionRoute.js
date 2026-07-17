import express from 'express';
import multer from 'multer';
import { createLiveSession, startLiveSession, updateLiveSession, joinLiveSession, teacherCreateLiveClassTotal, deleteLiveSession } from '../controllers/livesessionController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Configure multer with memory storage for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Create a new live session - uses multer for thumbnail upload
router.post('/', authMiddleware, upload.single('thumbnail'), createLiveSession);

router.post('/start', authMiddleware, startLiveSession);

// Join a live session (for students)
router.post('/join', authMiddleware, joinLiveSession);

// Update a live session - uses S3 uploadThumbnail from controller
router.put('/:sessionId', authMiddleware, upload.single('thumbnail'), updateLiveSession);

// Delete a live session
router.delete('/:sessionId', authMiddleware, deleteLiveSession);

// Get total live classes created by a teacher
router.get('/teacher/:teacherId/total', authMiddleware, teacherCreateLiveClassTotal);

export default router;
