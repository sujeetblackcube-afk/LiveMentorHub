import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  getNotes,
  streamVideo,
} from '../../controllers/notesController.js';

const router = express.Router();

// Add the streaming endpoint (Public route for <video> tags)
router.get('/stream', streamVideo);

router.use(authMiddleware);

// Get notes for student
router.get('/', getNotes);

export default router;
