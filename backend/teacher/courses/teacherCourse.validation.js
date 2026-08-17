export const validateTeacherCourseQuery = (query = {}) => {
  const { page, limit } = query;

  if (page !== undefined && (Number.isNaN(Number(page)) || Number(page) < 1)) {
    const error = new Error('page must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  if (limit !== undefined && (Number.isNaN(Number(limit)) || Number(limit) < 1)) {
    const error = new Error('limit must be a positive number');
    error.statusCode = 400;
    throw error;
  }
};
