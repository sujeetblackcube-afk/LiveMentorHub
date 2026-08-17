/**
 * Admin Course Validation Schemas
 */

/**
 * Validate Course Details Update
 */
export const validateCourseUpdate = (data) => {
  const errors = {};

  const allowedFields = [
    'courseName',
    'courseDescription',
    'courseType',
    'difficulty',
    'mrp',
    'discountedprice',
    'status',
    'deadline',
    'courseStartDate',
    'courseDuration',
    'board',
    'medium',
    'classname',
    'subject',
    'stream',
    'category',
    'subcategory',
    'targetAudience',
    'totalLessons',
    'thumbnail',
    'introVideo',
  ];

  // Validate that only allowed fields are being updated
  for (const field of Object.keys(data)) {
    if (!allowedFields.includes(field)) {
      errors[field] = `${field} is not allowed to be updated`;
    }
  }

  // Validate price fields if provided
  if (data.mrp !== undefined && isNaN(Number(data.mrp))) {
    errors.mrp = 'MRP must be a valid number';
  }

  if (data.discountedprice !== undefined && isNaN(Number(data.discountedprice))) {
    errors.discountedprice = 'Discounted price must be a valid number';
  }

  if (data.status !== undefined && !['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(data.status)) {
    errors.status = 'Status must be one of: ACTIVE, INACTIVE, ARCHIVED';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
