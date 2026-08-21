/**
 * Centralized Authentication Validator Index
 * Re-exports dedicated role request schemas from:
 * - studentAuth.validator.js
 * - teacherAuth.validator.js
 * - parentAuth.validator.js
 * - adminAuth.validator.js
 * - instituteAuth.validator.js
 */

export * from './validators/studentAuth.validator.js';
export * from './validators/teacherAuth.validator.js';
export * from './validators/parentAuth.validator.js';
export * from './validators/adminAuth.validator.js';
export * from './validators/instituteAuth.validator.js';

// Backward compatibility schemas
import { studentLoginSchema } from './validators/studentAuth.validator.js';
import { studentForgotPasswordSchema } from './validators/studentAuth.validator.js';
import { studentResetPasswordSchema } from './validators/studentAuth.validator.js';
import { studentSendOtpSchema } from './validators/studentAuth.validator.js';
import { studentVerifyOtpSchema } from './validators/studentAuth.validator.js';

export const loginSchema = studentLoginSchema;
export const forgotPasswordSchema = studentForgotPasswordSchema;
export const resetPasswordSchema = studentResetPasswordSchema;
export const sendOtpSchema = studentSendOtpSchema;
export const verifyOtpSchema = studentVerifyOtpSchema;
