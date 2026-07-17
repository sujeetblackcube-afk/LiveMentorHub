import express from "express";
import { savePlayerId,getStudentNotifications,deleteNotification,deleteAllNotifications,getNotificationByTeacherId,deleteAllNotificationByTeacher,getNotificationBySuperAdminId,deleteAllNotificationBySuperAdmin,deleteAllNotificationByParent,getNotificationByParentId } from "../controllers/notificationController.js";
import { sendBroadcast } from "../controllers/broadcastController.js";
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

router.post("/save-player-id", savePlayerId);
// student notification routes
router.get("/student/:studentId", getStudentNotifications);
router.delete("/:notificationId", deleteNotification);
router.delete("/student/all/:studentId", deleteAllNotifications);

// parent notification routes
router.get("/parent/:parentId", getNotificationByParentId);
router.delete("/parent/all/:parentId", deleteAllNotificationByParent);

// Teacher notification routes - require authentication
router.get("/teacher/notifications", authMiddleware, getNotificationByTeacherId);
router.delete("/teacher/notifications/all", authMiddleware, deleteAllNotificationByTeacher);


// Superadmin notification routes - require authentication
router.get("/superadmin/notifications", authMiddleware, getNotificationBySuperAdminId);
router.delete("/superadmin/notifications/all", authMiddleware, deleteAllNotificationBySuperAdmin);


// Broadcast route - requires authentication
router.post("/broadcast", authMiddleware, sendBroadcast);

export default router;
