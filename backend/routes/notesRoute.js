/**
 * Legacy notes routes.
 * Kept for rollback safety while the student/teacher notes modules are moved under
 * backend/student/notes and backend/teacher/notes.
 */

import express from "express";
// import {
//   addNotes,
//   getNotes,
//   deleteNote,
//   editNote,
//   uploadNotesFile,
//   contentCounter,
//   streamVideo,
// } from '../controllers/notesController.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// // Add the streaming endpoint (Public route for <video> tags)
// router.get('/stream', streamVideo);
// router.use(authMiddleware);
// router.post('/', uploadNotesFile, addNotes);
// router.get('/', getNotes);
// router.put('/:id', uploadNotesFile, editNote);
// router.delete('/:id', deleteNote);
// router.get('/count', contentCounter);

export default router;
