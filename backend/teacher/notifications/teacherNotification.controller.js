import {
  getNotificationByTeacherId,
  deleteAllNotificationByTeacher,
} from '../../controllers/notificationController.js';

export const getTeacherNotifications = getNotificationByTeacherId;
export const deleteAllTeacherNotifications = deleteAllNotificationByTeacher;
