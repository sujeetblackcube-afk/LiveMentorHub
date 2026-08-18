import { verifyJwt } from '../utils/jwt.js';
import { Student, Teacher, Parent, SuperAdmin } from '../models/index.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        isDeviceActive: false,
        isActiveDevice: false,
        isSessionActive: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyJwt(token);

    let user = null;

    switch (payload.role) {
      case "student":
        user = (payload.specificId ? await Student.findOne({ where: { studentId: payload.specificId } }) : null) ||
               (payload.userId ? await Student.findOne({ where: { userId: payload.userId } }) : null);
        break;

      case "teacher":
        user = (payload.specificId ? await Teacher.findOne({ where: { teacherId: payload.specificId } }) : null) ||
               (payload.userId ? await Teacher.findOne({ where: { userId: payload.userId } }) : null);
        break;

      case "parent":
        user = (payload.specificId ? await Parent.findOne({ where: { parentId: payload.specificId } }) : null) ||
               (payload.userId ? await Parent.findOne({ where: { userId: payload.userId } }) : null);
        break;

      case "superadmin":
        user = await SuperAdmin.findByPk(payload.userId);
        break;

      default:
        return res.status(401).json({
          status: false,
          message: "Invalid role in token",
        });
    }

    if (!user) {
      return res.status(401).json({
        status: false,
        isDeviceActive: false,
        isActiveDevice: false,
        isSessionActive: false,
        message: "Invalid token (user not found)",
      });
    }

    if (
      payload.role === "student" &&
      user.activeToken &&
      user.activeToken !== token
    ) {
      return res.status(401).json({
        status: false,
        isDeviceActive: false,
        isActiveDevice: false,
        isSessionActive: false,
        message: "Session expired or logged in from another device",
      });
    }

    if (payload.role === "student") {
      const originalJson = res.json;
      res.json = function (body) {
        if (body && typeof body === "object" && !Array.isArray(body)) {
          body.isDeviceActive = true;
          body.isActiveDevice = true;
          body.isSessionActive = true;
        }
        return originalJson.call(this, body);
      };
    }

    req.user = user;
    req.auth = payload;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      status: false,
      isDeviceActive: false,
      isActiveDevice: false,
      isSessionActive: false,
      message: "Unauthorized or token expired",
    });
  }
};

export default authMiddleware;
