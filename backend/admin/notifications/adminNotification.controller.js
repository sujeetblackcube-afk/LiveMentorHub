import {
  getNotificationBySuperAdminId,
  deleteAllNotificationBySuperAdmin,
} from '../../controllers/notificationController.js';

export const getAdminNotifications = getNotificationBySuperAdminId;
export const deleteAllAdminNotifications = deleteAllNotificationBySuperAdmin;
