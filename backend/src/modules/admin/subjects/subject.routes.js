/**
 * Admin Subject Management Routes
 * Manages course subjects
 * Public endpoint: /api/subjects
 */

import express from "express";
import {createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject, updateSubjectStatus } from '../../../modules/admin/subjects/subject.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);
router.use(requireSuperAdmin);

router.post("/", createSubject);
router.get("/", getAllSubjects);
router.get("/:subjectCode", getSubjectById);
router.put("/:subjectCode", updateSubject);
router.put("/:subjectCode/status", updateSubjectStatus);
router.delete("/:subjectCode", deleteSubject);

export default router;
