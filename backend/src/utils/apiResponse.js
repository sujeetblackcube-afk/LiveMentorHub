/**
 * Standardized API Response Helper
 */

export const successResponse = (res, message = "Success", data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: true,
    message,
    ...(data !== null && { data }),
  });
};

export const errorResponse = (res, message = "Error occurred", statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    status: false,
    message,
    ...(error && { error: typeof error === 'string' ? error : error.message }),
  });
};

export const paginatedResponse = (res, message = "Data fetched successfully", data = [], pagination = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: true,
    message,
    data,
    pagination: {
      totalItems: pagination.totalItems || data.length,
      totalPages: pagination.totalPages || 1,
      currentPage: pagination.currentPage || 1,
      limit: pagination.limit || data.length,
    },
  });
};
