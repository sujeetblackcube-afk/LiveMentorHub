import express from "express";
import {
  addNotes,
  getNotes,
  deleteNote,
  editNote,
  uploadNotesFile,
  contentCounter,
  streamVideo,
} from "../controllers/notesController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Add the streaming endpoint (Public route for <video> tags)
router.get("/stream", streamVideo);

router.use(authMiddleware);

// Add a new note
router.post("/", uploadNotesFile, addNotes);

// Get notes
router.get("/", getNotes);

// Edit a note
router.put("/:id", uploadNotesFile, editNote);

// Delete a note
router.delete("/:id", deleteNote);

//count notes for a teacher
router.get("/count", contentCounter);

export default router;