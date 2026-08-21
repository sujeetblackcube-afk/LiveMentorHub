/**
 * Centralized Authentication Controller Index
 * Delegates all authentication endpoints to clean, dedicated role controllers:
 * - studentAuth.controller.js
 * - teacherAuth.controller.js
 * - parentAuth.controller.js
 * - adminAuth.controller.js
 * - instituteAuth.controller.js
 */

export * from './controllers/studentAuth.controller.js';
export * from './controllers/teacherAuth.controller.js';
export * from './controllers/parentAuth.controller.js';
export * from './controllers/adminAuth.controller.js';
export * from './controllers/instituteAuth.controller.js';

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const verifyToken = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Token is valid and active', user: req.user });
};
