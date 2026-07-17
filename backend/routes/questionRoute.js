import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  createQuestionsFromExcel,
  uploadExcel,
} from "../controllers/questionController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a single question
router.post("/", createQuestion);

// Create questions from Excel file
router.post("/excel", uploadExcel, createQuestionsFromExcel);

// Get all questions (with optional filters)
router.get("/", getAllQuestions);

// Get question by ID
router.get("/:id", getQuestionById);

// Update a question
router.put("/:id", updateQuestion);

// Delete a question
router.delete("/:id", deleteQuestion);

export default router;
