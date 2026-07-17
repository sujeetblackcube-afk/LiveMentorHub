import express from "express";
import {
  getAllParents,
  updateParentStatus,
  getParentCount,
  getStudentsByParentId,
  updateParentData,
  getParentById,
  deleteParent
} from "../controllers/parentController.js";
import { uploadProfile } from "../controllers/parentController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllParents);
router.get("/count", getParentCount);
router.patch("/:parentId/status", updateParentStatus);
router.get("/students/:parentId", getStudentsByParentId);
router.put("/:parentId", uploadProfile.single('profileImage'), updateParentData);
router.get("/:parentId", getParentById);


// terminate parent account
router.delete("/delete-account/:parentId", deleteParent);

export default router;
