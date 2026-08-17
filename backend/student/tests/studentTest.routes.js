import express from 'express';
import authMiddleware from '../../middleware/authmiddleware.js';
import {
  fetchAllTestsForStudent,
  submitTestByStudent,
} from '../../controllers/testController.js';

const router = express.Router();

router.use(authMiddleware);

// Fetch all tests for a student
router.get('/:studentId', fetchAllTestsForStudent);

// Submit test by student
router.post('/submit', submitTestByStudent);

export default router;
