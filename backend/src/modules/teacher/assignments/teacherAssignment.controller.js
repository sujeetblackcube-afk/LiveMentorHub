import multer from "multer";
import path from "path";
import { uploadBufferToCloudinary } from '../../../utils/../config/cloudinary.config.js';
import Assignment from '../../../models/Assignment.js';
import AssignmentSubmission from '../../../models/AssignmentSubmission.js';
import Teacher from '../../../models/Teacher.js';
import Course from '../../../models/Course.js';
import Enrollment from '../../../models/Enrollment.js';
import { StudentLogin as Login, StudentNotification as Notification } from '../../../models/index.js';
import { triggerPushForNotifications } from '../../../config/onesignalService.js';
import { getPaginatedData } from '../../../utils/pagination.js';

// Controller to add a new assignment
export const addAssignment = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { courseCode, title, description, dueDate, totalMarks } = req.body;

    if (!courseCode || !teacherId || !title || !description || !dueDate || !totalMarks) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: courseCode, teacherId, title, description, dueDate, totalMarks",
      });
    }

    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    let fileUrl = null;
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "assignments", "auto");
        fileUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary assignment file upload error:", uploadError);
        return res.status(500).json({ success: false, message: "Error uploading assignment file" });
      }
    }

    const newAssignment = await Assignment.create({
      courseCode,
      teacherId,
      title,
      description,
      fileUrl,
      dueDate,
      totalMarks,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Assignment added successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Error adding assignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { courseCode, teacherId, page, limit } = req.query;

    const whereClause = {};
    if (courseCode) whereClause.courseCode = courseCode;
    if (teacherId) whereClause.teacherId = teacherId;

    const queryOptions = {
      where: whereClause,
      order: [["createdAt", "DESC"]],
    };

    if (page || limit) {
      const paginatedResult = await getPaginatedData(
        Assignment,
        queryOptions,
        page || 1,
        limit || 10
      );
      return res.status(200).json({
        success: true,
        assignments: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const assignments = await Assignment.findAll(queryOptions);
    res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    res.status(200).json({ success: true, assignment });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const editAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, totalMarks, isActive } = req.body;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (totalMarks !== undefined) assignment.totalMarks = totalMarks;
    if (isActive !== undefined) assignment.isActive = isActive;

    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "assignments", "auto");
        assignment.fileUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary assignment file update error:", uploadError);
        return res.status(500).json({ success: false, message: "Error uploading assignment file" });
      }
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    await assignment.destroy();
    res.status(200).json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, submissionText } = req.body;

    if (!assignmentId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: assignmentId, studentId",
      });
    }

    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    let submissionFileUrl = null;
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "assignment_submissions", "auto");
        submissionFileUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary submission upload error:", uploadError);
        return res.status(500).json({ success: false, message: "Error uploading submission file" });
      }
    }

    const submission = await AssignmentSubmission.create({
      assignmentId,
      studentId,
      submissionFileUrl,
      submissionText,
      teacherId: assignment.teacherId,
      courseCode: assignment.courseCode,
      status: "SUBMITTED",
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const submissions = await AssignmentSubmission.findAll({
      where: { studentId },
      include: [{ model: Assignment }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignmentOfStudentByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const submissions = await AssignmentSubmission.findAll({
      where: { teacherId },
      include: [{ model: Assignment }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching teacher student assignments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAssignmentByTeacher = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { obtainedMarks, feedback, status } = req.body;

    const submission = await AssignmentSubmission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (obtainedMarks !== undefined) submission.obtainedMarks = obtainedMarks;
    if (feedback !== undefined) submission.feedback = feedback;
    if (status !== undefined) submission.status = status;

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Assignment evaluated successfully",
      submission,
    });
  } catch (error) {
    console.error("Error evaluating assignment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadTeacherAssignmentFile = (req, res, next) => next();

export const addTeacherAssignment = addAssignment;
export const getTeacherAssignments = getAssignments;
export const getTeacherAssignmentById = getAssignmentById;
export const editTeacherAssignment = editAssignment;
export const deleteTeacherAssignment = deleteAssignment;
export const submitTeacherAssignment = submitAssignment;
export const getStudentTeacherAssignments = getStudentAssignments;
export const getTeacherAssignmentOfStudentByTeacher = getAssignmentOfStudentByTeacher;
export const checkTeacherAssignmentByTeacher = checkAssignmentByTeacher;
