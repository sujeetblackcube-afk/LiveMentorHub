/**
 * Centralized Authentication Service Index
 * Delegates role-specific database queries and session logic to dedicated service layers:
 * - studentAuth.service.js
 * - teacherAuth.service.js
 * - parentAuth.service.js
 * - adminAuth.service.js
 * - instituteAuth.service.js
 */

export * from './services/studentAuth.service.js';
export * from './services/teacherAuth.service.js';
export * from './services/parentAuth.service.js';
export * from './services/adminAuth.service.js';
export * from './services/instituteAuth.service.js';
export * from './auth.utils.js';
