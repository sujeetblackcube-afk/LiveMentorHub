import express from 'express';
import multer from 'multer';
import authMiddleware from '../../../middleware/auth.middleware.js';
import {
  createTeacherLiveSession,
  startTeacherLiveSession,
  joinTeacherLiveSession,
  updateTeacherLiveSession,
  deleteTeacherLiveSession,
  getTeacherLiveClassTotal,
  renewRtcTokenTeacher,
} from './teacherLiveSession.controller.js';

const router = express.Router();
const requireTeacherRole = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required',
    });
  }

  next();
};
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

router.use(authMiddleware);
router.use(requireTeacherRole);

router.post('/', upload.single('thumbnail'), createTeacherLiveSession);
router.post('/start', startTeacherLiveSession);
router.post('/join', joinTeacherLiveSession);
router.post('/renew-token', renewRtcTokenTeacher);
router.put('/:sessionId', upload.single('thumbnail'), updateTeacherLiveSession);
router.delete('/:sessionId', deleteTeacherLiveSession);
router.get('/teacher/:teacherId/total', getTeacherLiveClassTotal);

export default router;
