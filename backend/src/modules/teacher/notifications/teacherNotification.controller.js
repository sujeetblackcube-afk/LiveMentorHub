import {
  getNotificationByTeacherId,
  deleteAllNotificationByTeacher,
} from '../../admin/notifications/adminNotification.controller.js';

export const getTeacherNotifications = getNotificationByTeacherId;
export const deleteAllTeacherNotifications = deleteAllNotificationByTeacher;
