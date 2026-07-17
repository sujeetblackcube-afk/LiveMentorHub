import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import Teacher from "../models/Teacher.js";
import Notification from "../models/Notifications.js";


// for student send notification to all student
export const getStudentNotifications = async (req, res) => {
  try {
    const { studentId } = req.params;

    const notifications = await Notification.findAll({
      where: {
        specificId: studentId,
        role: "student",
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Notification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// for delete all notification by student

export const deleteAllNotifications = async (req, res) => {
  try {
    const { studentId } = req.params;

    await Notification.destroy({
      where: {
        specificId: studentId,
        role: "student",
      },
    });

    res.json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("Delete All Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for delete notification  single msg by student
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const deleted = await Notification.destroy({
      where: { notificationId },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for teacher get notifications
export const getNotificationByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.user;

    const notifications = await Notification.findAll({
      where: {
        specificId: teacherId,
        role: "teacher",
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Teacher Notification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for delete all notification by teacher
export const deleteAllNotificationByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.user;

    await Notification.destroy({
      where: {
        specificId: teacherId,
        role: "teacher",
      },
    });

    res.json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("Delete All Teacher Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for superadmin get notifications
export const getNotificationBySuperAdminId = async (req, res) => {
  try {
    // SuperAdmin model uses userId as primary key (INTEGER)
    const superAdminId = req.user.userId;

    const notifications = await Notification.findAll({
      where: {
        specificId: superAdminId.toString(),
        role: "superadmin",
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get SuperAdmin Notification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for delete all notification by superadmin
export const deleteAllNotificationBySuperAdmin = async (req, res) => {
  try {
    const { superAdminId } = req.user;

    await Notification.destroy({
      where: {
        specificId: superAdminId,
        role: "superadmin",
      },
    });

    res.json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("Delete All SuperAdmin Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for parent get notifications
export const getNotificationByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;

    const notifications = await Notification.findAll({
      where: {
        specificId: parentId,
        role: "parent",
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Parent Notification Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for delete all notification by parent
export const deleteAllNotificationByParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    await Notification.destroy({
      where: {
        specificId: parentId,
        role: "parent",
      },
    });

    res.json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("Delete All Parent Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// onesingler connection 

export const savePlayerId = async (req, res) => {
  try {
    const { playerId, role, studentId, parentId, teacherId, deviceType } =
      req.body;

    if (!playerId || !role) {
      return res.status(400).json({
        success: false,
        message: "playerId and role are required",
      });
    }

    if (role === "student" && studentId) {
      await Student.update(
        { playerId: playerId, Devicetype: deviceType },
        { where: { studentId: studentId } }
      );
    } else if (role === "parent" && parentId) {
      await Parent.update(
        { playerId: playerId, Devicetype: deviceType },
        { where: { parentId: parentId } }
      );
    } else if (role === "teacher" && teacherId) {
      await Teacher.update(
        { playerId: playerId, Devicetype: deviceType },
        { where: { teacherId: teacherId } }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role or missing ID",
      });
    }

    res.json({
      success: true,
      message: "Player ID saved successfully",
    });
  } catch (error) {
    console.error("Save PlayerId Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};