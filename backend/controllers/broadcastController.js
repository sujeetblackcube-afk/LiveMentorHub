import Notification from "../models/Notifications.js";
import Login from "../models/Login.js";
import Student from "../models/Student.js";  
import Teacher from "../models/Teacher.js";
import Parent from "../models/Parent.js";
import { sendToPlayerIds, triggerPushForNotifications } from "../config/onesignalService.js";
import pkg from 'sequelize';
const { Op } = pkg;

// Send broadcast to all users or selected users
export const sendBroadcast = async (req, res) => {
  try {
    const { 
      title, 
      message, 
      userType, // "all", "students", "enrolledStudents", "teachers", "parents"
      selectedStudentIds, 
      selectedTeacherIds, 
      selectedParentIds 
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notifications = [];
    let recipientCount = 0;

    if (userType === "all") {
      // Send to all students, teachers, and parents
      const [students, teachers, parents] = await Promise.all([
        Student.findAll({ where: { status: "APPROVED" }, attributes: ["studentId", "name"] }),
        Teacher.findAll({ where: { status: "APPROVED" }, attributes: ["teacherId", "name"] }),
        Parent.findAll({ where: { status: "APPROVED" }, attributes: ["parentId", "name"] }),
      ]);

      // Create notifications for all
      for (const student of students) {
        notifications.push({
          specificId: student.studentId,
          role: "student",
          title,
          message,
          type: "broadcast",
        });
      }
      for (const teacher of teachers) {
        notifications.push({
          specificId: teacher.teacherId,
          role: "teacher",
          title,
          message,
          type: "broadcast",
        });
      }
      for (const parent of parents) {
        notifications.push({
          specificId: parent.parentId,
          role: "parent",
          title,
          message,
          type: "broadcast",
        });
      }
      recipientCount = students.length + teachers.length + parents.length;

    } else if (userType === "students") {
      // Send to selected students or all approved students
      let students;
      if (selectedStudentIds && selectedStudentIds.length > 0) {
        students = await Student.findAll({
          where: {
            studentId: { [Op.in]: selectedStudentIds },
            status: "APPROVED"
          },
          attributes: ["studentId", "name"]
        });
      } else {
        students = await Student.findAll({
          where: { status: "APPROVED" },
          attributes: ["studentId", "name"]
        });
      }

      for (const student of students) {
        notifications.push({
          specificId: student.studentId,
          role: "student",
          title,
          message,
          type: "broadcast",
        });
      }
      recipientCount = students.length;

    } else if (userType === "enrolledStudents") {
      // Send only to selected enrolled students (via studentIds)
      if (!selectedStudentIds || selectedStudentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No students selected",
        });
      }

      const students = await Student.findAll({
        where: { 
          studentId: { [Op.in]: selectedStudentIds },
          status: "APPROVED"
        },
        attributes: ["studentId", "name"]
      });

      for (const student of students) {
        notifications.push({
          specificId: student.studentId,
          role: "student",
          title,
          message,
          type: "broadcast",
        });
      }
      recipientCount = students.length;

    } else if (userType === "teachers") {
      // Send to all approved teachers or selected teachers
      let teachers;
      if (selectedTeacherIds && selectedTeacherIds.length > 0) {
        teachers = await Teacher.findAll({
          where: { 
            teacherId: { [Op.in]: selectedTeacherIds },
            status: "APPROVED"
          },
          attributes: ["teacherId", "name"]
        });
      } else {
        teachers = await Teacher.findAll({ 
          where: { status: "APPROVED" }, 
          attributes: ["teacherId", "name"] 
        });
      }

      for (const teacher of teachers) {
        notifications.push({
          specificId: teacher.teacherId,
          role: "teacher",
          title,
          message,
          type: "broadcast",
        });
      }
      recipientCount = teachers.length;

    } else if (userType === "parents") {
      // Send to all approved parents or selected parents
      let parents;
      if (selectedParentIds && selectedParentIds.length > 0) {
        parents = await Parent.findAll({
          where: {
            parentId: { [Op.in]: selectedParentIds },
            status: "APPROVED"
          },
          attributes: ["parentId", "name"]
        });
      } else {
        parents = await Parent.findAll({
          where: { status: "APPROVED" },
          attributes: ["parentId", "name"]
        });
      }

      for (const parent of parents) {
        notifications.push({
          specificId: parent.parentId,
          role: "parent",
          title,
          message,
          type: "broadcast",
        });
      }
      recipientCount = parents.length;

    } else if (userType === "selected") {
      // Send to selected users from different types
      const promises = [];

      if (selectedStudentIds && selectedStudentIds.length > 0) {
        promises.push(Student.findAll({
          where: {
            studentId: { [Op.in]: selectedStudentIds }
          },
          attributes: ["studentId", "name"]
        }));
      } else {
        promises.push(Promise.resolve([]));
      }

      if (selectedTeacherIds && selectedTeacherIds.length > 0) {
        promises.push(Teacher.findAll({
          where: {
            teacherId: { [Op.in]: selectedTeacherIds }
          },
          attributes: ["teacherId", "name"]
        }));
      } else {
        promises.push(Promise.resolve([]));
      }

      if (selectedParentIds && selectedParentIds.length > 0) {
        promises.push(Parent.findAll({
          where: {
            parentId: { [Op.in]: selectedParentIds }
          },
          attributes: ["parentId", "name"]
        }));
      } else {
        promises.push(Promise.resolve([]));
      }

      const [students, teachers, parents] = await Promise.all(promises);

      // Create notifications for selected students
      for (const student of students) {
        notifications.push({
          specificId: student.studentId,
          role: "student",
          title,
          message,
          type: "broadcast",
        });
      }

      // Create notifications for selected teachers
      for (const teacher of teachers) {
        notifications.push({
          specificId: teacher.teacherId,
          role: "teacher",
          title,
          message,
          type: "broadcast",
        });
      }

      // Create notifications for selected parents
      for (const parent of parents) {
        notifications.push({
          specificId: parent.parentId,
          role: "parent",
          title,
          message,
          type: "broadcast",
        });
      }

      recipientCount = students.length + teachers.length + parents.length;
    }

    if (notifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No recipients found",
      });
    }

    // Save all notifications to database
    const savedNotifications = await Notification.bulkCreate(notifications);

    // Trigger push notifications
    await triggerPushForNotifications(savedNotifications);

    res.status(201).json({
      success: true,
      message: "Broadcast sent successfully",
      recipientCount,
    });

  } catch (error) {
    console.error("Send Broadcast Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
