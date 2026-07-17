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
} from '../controllers/contentController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Get all content
router.get('/', getAllContent);

// Get content by key
router.get('/key/:key', getContentByKey);

// Create or update content by key
router.post('/key', createOrUpdateContent);
// View content as HTML by id
router.get("/content/:id", viewContentHTML);


// Update content by key
router.put('/key/:key', updateContentByKey);

// Delete content by key
router.delete('/key/:key', deleteContentByKey);

// Get content by ID
router.get('/:id', getContentById);

// Update content by ID
router.put('/:id', updateContentById);

// Delete content by ID
router.delete('/:id', deleteContentById);

export default router;
