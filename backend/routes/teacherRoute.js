import express from 'express';
import teacherRoutes from '../teacher/teacher.routes.js';

const router = express.Router();

// Public teacher route contract is preserved at the same URLs.
// The legacy monolithic controller logic has been moved into the internal teacher module.
router.use('/', teacherRoutes);

export default router;
