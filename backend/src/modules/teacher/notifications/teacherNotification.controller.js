import {
  getNotificationByTeacherId,
  deleteAllNotificationByTeacher,
  deleteNotification,
} from '../../admin/notifications/adminNotification.controller.js';

export const getTeacherNotifications = getNotificationByTeacherId;
export const deleteAllTeacherNotifications = deleteAllNotificationByTeacher;
export const deleteNotificationById = deleteNotification;
