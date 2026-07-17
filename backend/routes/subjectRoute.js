import express from "express";
import {createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject, updateSubjectStatus } from "../controllers/subjectcontroller.js";
import authMiddleware from '../middleware/authmiddleware.js';
const router = express.Router();

router.use(authMiddleware);


router.post("/", createSubject);
router.get("/", getAllSubjects);
router.get("/:subjectCode", getSubjectById);
router.put("/:subjectCode", updateSubject);
router.put("/:subjectCode/status", updateSubjectStatus);
router.delete("/:subjectCode", deleteSubject);


export default router;
