/**
 * Admin Class Management Routes
 * Manages course classes and hierarchy
 * Consolidates class and subject management
 * Public endpoints: /api/classes, /api/subjects
 */

import express from "express";
import { createClass, getAllClasses, updateClassStatus, editClass, deleteClass, getSubjectsByClass } from "../../controllers/classController.js";
import {createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject, updateSubjectStatus } from "../../controllers/subjectcontroller.js";
import authMiddleware from '../../middleware/authmiddleware.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.use(authMiddleware);
router.use(requireSuperAdmin);

router.post("/", createClass);
router.get("/", getAllClasses);
router.patch("/:id/status", updateClassStatus);
router.put("/:id", editClass);
router.delete("/:id", deleteClass);
router.get("/:id/subjects", getSubjectsByClass);

export default router;
