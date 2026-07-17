import multer from "multer";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Login from "../models/Login.js";
import Notification from "../models/Notifications.js";
import { triggerPushForNotifications } from "../config/onesignalService.js";

// Configure multer with memory storage for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, videos, documents
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "video/mp4",
      "video/avi",
      "video/mov",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, PDFs, videos, and documents are allowed.",
        ),
        false,
      );
    }
  },
});

// Controller to add a new assignment
export const addAssignment = async (req, res) => {
  try {
    // teacherId comes from URL params, courseCode comes from body
    const { teacherId } = req.params;
    const { courseCode, title, description, dueDate, totalMarks } = req.body;

    // Validate required fields
    if (
      !courseCode ||
      !teacherId ||
      !title ||
      !description ||
      !dueDate ||
      !totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: courseCode, teacherId, title, description, dueDate, totalMarks",
      });
    }

    // Fetch teacherName from Teacher table using teacherId
    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    const teacherName = teacher.name;

    // Fetch courseName from Course table using courseCode (optional, for validation)
    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found with this courseCode",
      });
    }

    // Get file information if uploaded
    let fileUrl = null;
    let fileType = null;
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "assignments");
        fileUrl = result.secure_url;
        fileType = req.file.mimetype;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "Error uploading file" });
      }
    }

    // Create Assignment entry
    const newAssignment = await Assignment.create({
      title,
      description,
      courseCode,
      teacherId,
      teacherName,
      dueDate,
      totalMarks: parseInt(totalMarks),
      fileUrl,
      fileType,
    });
    // AFTER THIS, add the logic to create AssignmentSubmission entries for all enrolled students
    // Fetch all approved enrollments for this course
    const enrollments = await Enrollment.findAll({
      where: {
        courseCode: courseCode,
        teacherId: teacherId, // filter by same teacher
        status: "APPROVED",
      },
    });

    // Create AssignmentSubmission for each enrolled student

    if (enrollments.length > 0) {
      const submissionsData = enrollments.map((enrollment) => ({
        assignmentId: newAssignment.id,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        teacherId: teacherId,
        teacherName: teacherName,
        courseCode: courseCode,
        submissionText: null,
        submissionFileUrl: null,
        submissionFileType: null,
        obtainedMarks: 0,
        status: "notsubmitted",
        submittedAt: null,
      }));

      await AssignmentSubmission.bulkCreate(submissionsData);
      // ================= NOTIFICATIONS (STUDENT + PARENT) =================
      const notifications = [];

      enrollments.forEach((enrollment) => {
        // 🔔 Student Notification
        notifications.push({
          specificId: enrollment.studentId,
          role: "student",
          title: "📚 New Assignment Added",
          message: `${title} uploaded for ${
            course?.courseName || courseCode
          }. Due: ${dueDate}`,
          type: "assignment",
          referenceId: newAssignment.id,
        });
      });

      // Save all notifications in DB (single bulk insert)
      const createdNotifications = await Notification.bulkCreate(
        notifications,
        { returning: true },
      );

      // 🔥 CENTRALIZED PUSH (ONE SIGNAL HIT ONLY ONCE)
      await triggerPushForNotifications(createdNotifications);
    }

    res.status(201).json({
      success: true,
      message: "Assignment added successfully and notifications sent",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Error adding assignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export the upload middleware
export const uploadAssignmentFile = upload.single("file");

//changed
// Controller to get assignments - supports filtering by teacherId and optionally by courseCode
export const getAssignments = async (req, res) => {
  try {
    // Get teacherId and courseCode from query params
    const { teacherId, courseCode } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required",
      });
    }

    // Build where clause - filter by teacherId and optionally by courseCode
    const whereClause = {
      teacherId: teacherId,
    };

    // Add courseCode filter if provided
    if (courseCode) {
      whereClause.courseCode = courseCode;
    }

    const assignments = await Assignment.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//ok
// Controller to get assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//ok
// Controller to edit an assignment
export const editAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, totalMarks } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Update fields if provided
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (totalMarks !== undefined) updateData.totalMarks = parseInt(totalMarks);

    // Handle file upload if provided
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "assignments");
        updateData.fileUrl = result.secure_url;
        updateData.fileType = req.file.mimetype;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "Error uploading file" });
      }
    }

    const [updatedRows] = await Assignment.update(updateData, {
      where: { id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or no changes made",
      });
    }

    const updatedAssignment = await Assignment.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//ok
// Controller to delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const deletedRows = await Assignment.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//ok
// Controller to submit an assignment
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, submissionText } = req.body;

    if (!assignmentId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "assignmentId and studentId are required",
      });
    }

    // Check assignment exists
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if due date has passed
    // dueDate is often stored as a date-only value (e.g. 2026-05-18 00:00:00+00).
    // If we compare against current time, it will be expired after midnight.
    // So treat dueDate as the whole day (end of day).
    const currentDate = new Date();
    const dueDate = new Date(assignment.dueDate);
    dueDate.setHours(23, 59, 59, 999);

    if (currentDate > dueDate) {
      return res.status(403).json({
        success: false,
        message:
          "Assignment submission deadline has passed. You can no longer submit this assignment.",
      });
    }

    // Find existing submission (it should already exist)
    const submission = await AssignmentSubmission.findOne({
      where: { assignmentId, studentId },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission record not found for this student",
      });
    }

    // File handling
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, `student/${studentId}`);
        submission.submissionFileUrl = result.secure_url;
        submission.submissionFileType = req.file.mimetype;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "Error uploading file" });
      }
    }

    // Update submission
    submission.submissionText = submissionText || submission.submissionText;
    submission.status = "submitted";
    submission.submittedAt = new Date();

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//ok
// Controller to get assignments by studentId
export const getStudentAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    // Find all assignment submissions for this student
    const submissions = await AssignmentSubmission.findAll({
      where: {
        studentId: studentId,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!submissions.length) {
      return res.status(404).json({
        success: false,
        message: "No assignments found for this student",
      });
    }

    // Get assignment IDs from submissions
    const assignmentIds = submissions.map((sub) => sub.assignmentId);

    // Fetch corresponding assignments from Assignment table
    const assignments = await Assignment.findAll({
      where: {
        id: assignmentIds,
      },
    });

    // Create a map for quick lookup
    const assignmentMap = {};
    assignments.forEach((assignment) => {
      assignmentMap[assignment.id] = assignment;
    });

    // Combine submission data with assignment details
    const result = submissions.map((submission) => {
      const assignment = assignmentMap[submission.assignmentId];
      return {
        // Submission fields
        id: submission.id,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        studentName: submission.studentName,
        teacherId: submission.teacherId,
        teacherName: submission.teacherName,
        courseCode: submission.courseCode,
        submissionText: submission.submissionText,
        submissionFileType: submission.submissionFileType,
        submissionFileUrl: submission.submissionFileUrl,
        obtainedMarks: submission.obtainedMarks,
        feedback: submission.feedback,
        status: submission.status,
        submittedAt: submission.submittedAt,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        // Assignment fields from Assignment table
        title: assignment ? assignment.title : null,
        description: assignment ? assignment.description : null,
        totalMarks: assignment ? assignment.totalMarks : null,
        fileUrl: assignment ? assignment.fileUrl : null,
        dueDate: assignment ? assignment.dueDate : null,
        fileType: assignment ? assignment.fileType : null,
        assignmentCreatedAt: assignment ? assignment.createdAt : null,
      };
    });

    res.status(200).json({
      success: true,
      assignments: result, // array of assignments with submission and assignment details
    });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ok
// Controller to get assignments of students by teacherId
export const getAssignmentOfStudentByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required",
      });
    }

    // Find teacher by teacherId
    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Get courseCode array from teacher's JSON field
    const courseCodes = teacher.courseCode;

    if (
      !courseCodes ||
      !Array.isArray(courseCodes) ||
      courseCodes.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "No assignments found",
        students: [],
        statusCounts: {
          total: 0,
          submitted: 0,
          notsubmitted: 0,
          checked: 0
        }
      });
    }

    // Build query for AssignmentSubmission
    const whereClause = {
      teacherId: teacherId,
      courseCode: courseCodes,
    };

    // Add status filter if provided
    if (status) {
      const validStatuses = ["submitted", "notsubmitted", "checked"];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: submitted, notsubmitted, checked",
        });
      }
      whereClause.status = status.toLowerCase();
    }

    // Find all assignment submissions for teacher's courses
    const submissions = await AssignmentSubmission.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!submissions.length) {
      return res.status(200).json({
        success: true,
        message: "No assignments found",
        students: [],
        statusCounts: {
          total: 0,
          submitted: 0,
          notsubmitted: 0,
          checked: 0
        }
      });
    }

    // Get unique assignment IDs from submissions
    const assignmentIds = [
      ...new Set(submissions.map((sub) => sub.assignmentId)),
    ];

    // Fetch corresponding assignments from Assignment table
    const assignments = await Assignment.findAll({
      where: {
        id: assignmentIds,
      },
    });

    // Create a map for quick lookup
    const assignmentMap = {};
    assignments.forEach((assignment) => {
      assignmentMap[assignment.id] = assignment;
    });

    // Group submissions by student
    const studentMap = {};
    submissions.forEach((submission) => {
      const studentId = submission.studentId;
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          studentId: submission.studentId,
          studentName: submission.studentName,
          assignments: [],
        };
      }

      const assignment = assignmentMap[submission.assignmentId];
      studentMap[studentId].assignments.push({
        id: submission.id,
        assignmentId: submission.assignmentId,
        courseCode: submission.courseCode,
        submissionText: submission.submissionText,
        submissionFileType: submission.submissionFileType,
        submissionFileUrl: submission.submissionFileUrl,
        obtainedMarks: submission.obtainedMarks,
        feedback: submission.feedback,
        status: submission.status,
        submittedAt: submission.submittedAt,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        // Assignment details
        title: assignment ? assignment.title : null,
        description: assignment ? assignment.description : null,
        totalMarks: assignment ? assignment.totalMarks : null,
        dueDate: assignment ? assignment.dueDate : null,
      });
    });

    // Convert student map to array
    const students = Object.values(studentMap);

    // Get counts for each status
    const allSubmissions = await AssignmentSubmission.findAll({
      where: {
        teacherId: teacherId,
        courseCode: courseCodes,
      },
    });

    const statusCounts = {
      total: allSubmissions.length,
      submitted: allSubmissions.filter((s) => s.status === "submitted").length,
      notsubmitted: allSubmissions.filter((s) => s.status === "notsubmitted")
        .length,
      checked: allSubmissions.filter((s) => s.status === "checked").length,
    };

    res.status(200).json({
      success: true,
      teacherId: teacherId,
      teacherName: teacher.name,
      courseCodes: courseCodes,
      statusCounts: statusCounts,
      students: students,
    });
  } catch (error) {
    console.error("Error fetching student assignments by teacher:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//ok
// Controller to check/update assignment by teacher
export const checkAssignmentByTeacher = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { teacherId, obtainedMarks, feedback } = req.body;

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: "submissionId is required",
      });
    }

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required",
      });
    }

    // Find the teacher
    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Find the submission
    const submission = await AssignmentSubmission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Update the submission
    if (obtainedMarks !== undefined && obtainedMarks !== null) {
      submission.obtainedMarks = parseInt(obtainedMarks);
    }

    if (feedback !== undefined) {
      submission.feedback = feedback;
    }

    // Always update teacherId and teacherName to the current teacher checking
    submission.teacherId = teacherId;
    submission.teacherName = teacher.name;

    // Change status to checked
    submission.status = "checked";

    // Calculate percentage if obtainedMarks is set
    if (obtainedMarks !== undefined && obtainedMarks !== null && obtainedMarks >= 0) {
      // Fetch totalMarks from Assignment table
      const assignment = await Assignment.findByPk(submission.assignmentId);
      if (assignment && assignment.totalMarks > 0) {
        submission.percentage = (submission.obtainedMarks / assignment.totalMarks) * 100;
      }
    }

    await submission.save();

    res.status(200).json({
      success: true,
      message: "Assignment checked successfully",
      submission: submission,
    });
  } catch (error) {
    console.error("Error checking assignment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
