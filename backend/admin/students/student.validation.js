/**
 * Admin Student Validation Schemas
 */

/**
 * Validate Student Status Update
 */
export const validateStudentStatusUpdate = (data) => {
  const errors = {};

  if (!data.status || typeof data.status !== 'string') {
    errors.status = 'Status is required and must be a string';
  }

  if (data.status && !['APPROVED', 'SUSPENDED', 'TERMINATED'].includes(data.status)) {
    errors.status = 'Invalid status. Allowed: APPROVED, SUSPENDED, TERMINATED';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
