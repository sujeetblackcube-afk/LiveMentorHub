import express from "express";
import { getHomeData } from "../androidcontrollers/homecontrollers.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

// Android Home API - accepts studentId as URL parameter
router.get("/home/:studentId", getHomeData);

export default router;
