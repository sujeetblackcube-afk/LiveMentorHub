import express from "express";
import { createClass, getAllClasses, updateClassStatus, editClass, deleteClass, getSubjectsByClass } from "../controllers/classController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post("/", createClass);
router.get("/", getAllClasses);
router.patch("/:id/status", updateClassStatus);
router.put("/:id", editClass);
router.delete("/:id", deleteClass);
router.get("/:id/subjects", getSubjectsByClass);

export default router;
