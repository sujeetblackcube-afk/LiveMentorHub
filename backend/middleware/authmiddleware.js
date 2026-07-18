import { verifyJwt } from "../utils/jwt.js";
import { Student, Teacher, Parent, SuperAdmin } from "../models/index.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyJwt(token);

    let user = null;

    switch (payload.role) {
      case "student":
        user = await Student.findOne({
          where: { studentId: payload.specificId },
        });
        break;

      case "teacher":
        user = await Teacher.findOne({
          where: { teacherId: payload.specificId },
        });
        break;

      case "parent":
        user = await Parent.findOne({
          where: { parentId: payload.specificId },
        });
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
        message: "Invalid token (user not found)",
      });
    }

    // Check if the token matches either the active web token or active app token (skip single-device check for superadmin)
    if (payload.role !== "superadmin" && user.activeWebToken !== token && user.activeAppToken !== token) {
      return res.status(401).json({
        status: false,
        message: "Session expired or logged in from another device",
      });
    }

    // attach data to request
    req.user = user;
    req.auth = payload; // role, specificId, userId

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      status: false,
      message: "Unauthorized or token expired",
    });
  }
};

export default authMiddleware;
