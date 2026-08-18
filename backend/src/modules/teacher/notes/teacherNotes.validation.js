export const validateTeacherNotePayload = (payload = {}) => {
  const { courseCode, courseType, teacherId, title, contentType } = payload;

  if (!courseCode || !courseType || !teacherId || !title || !contentType) {
    const error = new Error('Missing required fields: courseCode, courseType, teacherId, title, contentType');
    error.statusCode = 400;
    throw error;
  }
};
