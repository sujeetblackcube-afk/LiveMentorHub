import { TeacherNotification } from '../../../models/Teacher.js';

export const getTeacherNotificationsService = async (teacherId) => {
  return await TeacherNotification.findAll({
    where: { teacherId },
    order: [['createdAt', 'DESC']],
  });
};
