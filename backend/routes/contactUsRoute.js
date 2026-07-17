import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactStatus,
  deleteContact,
  sendReply
} from '../controllers/contactUsController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Public routes (for contact form submission)
router.post('/', createContact);   

// Protected routes (require authentication)
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.put('/:id/status', updateContactStatus);
router.put('/:id/reply', sendReply);
router.delete('/:id', deleteContact);

export default router;
