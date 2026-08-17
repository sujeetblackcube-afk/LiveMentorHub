/**
 * Authentication Validation Schemas
 * Validates request data for all authentication endpoints
 */

/**
 * Validate Student Signup Request
 */
export const validateStudentSignup = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required and must be a string';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.mobile || !isValidMobile(data.mobile)) {
    errors.mobile = 'Valid mobile number is required';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters';
  }

  if (!data.parentName || typeof data.parentName !== 'string') {
    errors.parentName = 'Parent name is required';
  }

  if (!data.parentEmail || !isValidEmail(data.parentEmail)) {
    errors.parentEmail = 'Valid parent email is required';
  }

  if (!data.parentMobile || !isValidMobile(data.parentMobile)) {
    errors.parentMobile = 'Valid parent mobile is required';
  }

  if (!data.gender || !['Male', 'Female', 'Other'].includes(data.gender)) {
    errors.gender = 'Valid gender is required (Male, Female, or Other)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Teacher Signup Request
 */
export const validateTeacherSignup = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required and must be a string';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.mobile || !isValidMobile(data.mobile)) {
    errors.mobile = 'Valid mobile number is required';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters';
  }

  if (!data.qualification || typeof data.qualification !== 'string') {
    errors.qualification = 'Qualification is required';
  }

  if (!data.gender || !['Male', 'Female', 'Other'].includes(data.gender)) {
    errors.gender = 'Valid gender is required (Male, Female, or Other)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Parent Signup Request
 */
export const validateParentSignup = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required and must be a string';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.mobile || !isValidMobile(data.mobile)) {
    errors.mobile = 'Valid mobile number is required';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate SuperAdmin Signup Request
 */
export const validateSuperAdminSignup = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required and must be a string';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.mobile || !isValidMobile(data.mobile)) {
    errors.mobile = 'Valid mobile number is required';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Login Request
 */
export const validateLogin = (data) => {
  const errors = {};

  if (!data.identifier) {
    errors.identifier = 'Email or mobile is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  if (!data.role || !['student', 'teacher', 'parent', 'superadmin'].includes(data.role)) {
    errors.role = 'Valid role is required (student, teacher, parent, superadmin)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate OTP Verification Request
 */
export const validateOtpVerification = (data) => {
  const errors = {};

  if (!data.identifier) {
    errors.identifier = 'Email or mobile is required';
  }

  if (!data.otp || typeof data.otp !== 'string') {
    errors.otp = 'OTP is required and must be a string';
  }

  if (!data.role || !['student', 'teacher', 'parent', 'superadmin'].includes(data.role)) {
    errors.role = 'Valid role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Resend OTP Request
 */
export const validateResendOtp = (data) => {
  const errors = {};

  if (!data.identifier) {
    errors.identifier = 'Email or mobile is required';
  }

  if (!data.role || !['student', 'teacher', 'parent', 'superadmin'].includes(data.role)) {
    errors.role = 'Valid role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Forgot Password Request
 */
export const validateForgotPassword = (data) => {
  const errors = {};

  if (!data.identifier) {
    errors.identifier = 'Email or mobile is required';
  }

  if (!data.role || !['student', 'teacher', 'parent', 'superadmin'].includes(data.role)) {
    errors.role = 'Valid role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Reset Password Request
 */
export const validateResetPassword = (data) => {
  const errors = {};

  if (!data.identifier) {
    errors.identifier = 'Email or mobile is required';
  }

  if (!data.role || !['student', 'teacher', 'parent', 'superadmin'].includes(data.role)) {
    errors.role = 'Valid role is required';
  }

  if (!data.newPassword || data.newPassword.length < 6) {
    errors.newPassword = 'New password is required and must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Helper: Validate Email Format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper: Validate Mobile Format
 * Accepts 10-15 digit numbers
 */
const isValidMobile = (mobile) => {
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(mobile);
};
