/**
 * Admin Teacher Validation Schemas
 */

/**
 * Validate Teacher Status Update
 */
export const validateTeacherStatusUpdate = (data) => {
  const errors = {};

  if (!data.status || typeof data.status !== 'string') {
    errors.status = 'Status is required and must be a string';
  }

  if (data.status && !['PENDING', 'APPROVED', 'SUSPENDED', 'TERMINATED'].includes(data.status)) {
    errors.status = 'Invalid status. Allowed: PENDING, APPROVED, SUSPENDED, TERMINATED';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Course Name Update
 */
export const validateUpdateCoursename = (data) => {
  const errors = {};

  if (!data.coursename) {
    errors.coursename = 'Coursename is required';
  }

  if (data.coursename && Array.isArray(data.coursename) && data.coursename.length === 0) {
    errors.coursename = 'At least one course must be provided';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
