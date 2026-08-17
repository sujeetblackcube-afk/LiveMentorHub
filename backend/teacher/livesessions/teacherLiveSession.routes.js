import express from 'express';
import multer from 'multer';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  createTeacherLiveSession,
  startTeacherLiveSession,
  joinTeacherLiveSession,
  updateTeacherLiveSession,
  deleteTeacherLiveSession,
  getTeacherLiveClassTotal,
} from './teacherLiveSession.controller.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

router.post('/', authMiddleware, upload.single('thumbnail'), createTeacherLiveSession);
router.post('/start', authMiddleware, startTeacherLiveSession);
router.post('/join', authMiddleware, joinTeacherLiveSession);
router.put('/:sessionId', authMiddleware, upload.single('thumbnail'), updateTeacherLiveSession);
router.delete('/:sessionId', authMiddleware, deleteTeacherLiveSession);
router.get('/teacher/:teacherId/total', authMiddleware, getTeacherLiveClassTotal);

export default router;
