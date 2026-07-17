import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.auth && req.auth.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Forbidden" });
  }
};

router.get("/stats", authMiddleware, requireSuperAdmin, getDashboardStats);

export default router;
