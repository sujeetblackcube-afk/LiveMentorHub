/**
 * Role Guard Middleware
 * Explicitly guards API endpoints based on authenticated user roles:
 * - Public / Unauthorized (allowed via skip or public routes)
 * - Student ('student')
 * - Parent ('parent')
 * - Teacher ('teacher')
 * - SuperAdmin ('superadmin')
 */

/**
 * Enforce one or more allowed roles for an endpoint
 * @param  {...string} allowedRoles Roles allowed to access the route
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        status: false,
        message: "Unauthorized: Access token required",
      });
    }

    const userRole = req.auth.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        status: false,
        message: `Forbidden: Access restricted. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Convenient pre-configured role guards
 */
export const requireStudent = requireRole('student');
export const requireParent = requireRole('parent');
export const requireTeacher = requireRole('teacher');
export const requireSuperAdmin = requireRole('superadmin');

// Combined guards
export const requireTeacherOrAdmin = requireRole('teacher', 'superadmin');
export const requireStudentOrAdmin = requireRole('student', 'superadmin');
export const requireParentOrAdmin = requireRole('parent', 'superadmin');
