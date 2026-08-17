/**
 * Legacy live session routes.
 * Kept for rollback safety while the teacher live session module is moved under
 * backend/teacher/livesessions.
 */

import express from 'express';
// import multer from 'multer';
// import { createLiveSession, startLiveSession, updateLiveSession, joinLiveSession, teacherCreateLiveClassTotal, deleteLiveSession } from '../controllers/livesessionController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   },
// });

// router.post('/', authMiddleware, upload.single('thumbnail'), createLiveSession);
// router.post('/start', authMiddleware, startLiveSession);
// router.post('/join', authMiddleware, joinLiveSession);
// router.put('/:sessionId', authMiddleware, upload.single('thumbnail'), updateLiveSession);
// router.delete('/:sessionId', authMiddleware, deleteLiveSession);
// router.get('/teacher/:teacherId/total', authMiddleware, teacherCreateLiveClassTotal);

export default router;
