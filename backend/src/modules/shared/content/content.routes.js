import express from 'express';
import {
  getAllContent,
  getContentByKey,
  createOrUpdateContent,
  updateContentByKey,
  deleteContentByKey,
  getContentById,
  updateContentById,
  deleteContentById,
  viewContentHTML
} from '../../../modules/shared/content/content.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

// Public GET routes (accessible by students, teachers, guests, and admin without blocking)
router.get('/', getAllContent);
router.get('/key/:key', getContentByKey);
router.get("/content/:id", viewContentHTML);

// Protected mutation routes (require authenticated admin token)
router.post('/key', authMiddleware, createOrUpdateContent);
router.put('/key/:key', authMiddleware, updateContentByKey);
router.delete('/key/:key', authMiddleware, deleteContentByKey);
router.get('/:id', authMiddleware, getContentById);
router.put('/:id', authMiddleware, updateContentById);
router.delete('/:id', authMiddleware, deleteContentById);

export default router;
