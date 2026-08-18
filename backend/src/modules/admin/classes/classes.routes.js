/**
 * Admin Class Management Routes
 * Manages course classes and hierarchy
 * Consolidates class and subject management
 * Public endpoints: /api/classes, /api/subjects
 */

import express from "express";
import { createClass, getAllClasses, updateClassStatus, editClass, deleteClass, getSubjectsByClass } from '../../../modules/admin/classes/classLegacy.controller.js';
import {createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject, updateSubjectStatus } from '../../../modules/admin/subjects/subject.controller.js';
import authMiddleware from '../../../middleware/auth.middleware.js';

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && ['superadmin', 'admin', 'subadmin'].includes(req.auth.role)) {
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
