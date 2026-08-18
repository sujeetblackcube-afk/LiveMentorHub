export const validateTeacherTestPayload = (payload = {}) => {
  const { courseCode, teacherId, title, durationMinutes, startTime, endTime } = payload;

  if (!courseCode || !teacherId || !title || !durationMinutes || !startTime || !endTime) {
    const error = new Error('Required fields missing: courseCode, teacherId, title, durationMinutes, startTime, endTime');
    error.statusCode = 400;
    throw error;
  }
};
