import { Doubt, Student, Course, Teacher, Enrollment, Notification } from '../models/index.js';
import { triggerPushForNotifications } from '../config/onesignalService.js';
import pkg from 'sequelize';
const { Op } = pkg;

export const createDoubt = async (req, res) => {
  try {
    const { studentId, courseCode, doubtText, doubtTitle } = req.body;

    // Validate required fields
    if (!studentId || !courseCode || !doubtText || !doubtTitle) {
      return res.status(400).json({
        success: false,
        message: 'studentId, courseCode, doubtText, and doubtTitle are required'
      });
    }

    // Fetch student name
    const student = await Student.findOne({
      where: { studentId: studentId },
      attributes: ['name']
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch course name
    const course = await Course.findOne({
      where: { courseCode: courseCode },
      attributes: ['courseName']
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find enrollment for student with this courseCode to get teacher info
    let teacherId = null;
    let teacherName = null;

    const enrollment = await Enrollment.findOne({
      where: {
        studentId,
        courseCode
      },
      attributes: ['teacherId']
    });

    if (enrollment && enrollment.teacherId) {
      teacherId = enrollment.teacherId;

      // Fetch teacher's name
      const teacher = await Teacher.findOne({
        where: { teacherId },
        attributes: ['name']
      });

      if (teacher) {
        teacherName = teacher.name;
      }
    }

    // Create doubt
    const doubtData = {
      studentId,
      studentName: student.name,
      courseCode,
      courseName: course.courseName,
      doubtText,
      doubtTitle,
      status: 'notreplied'
    };

    // Add teacher info if available
    if (teacherId) {
      doubtData.teacherId = teacherId;
    }
    if (teacherName) {
      doubtData.teacherName = teacherName;
    }

    const doubt = await Doubt.create(doubtData);

    // ================= NOTIFICATIONS (TEACHER) =================
    if (teacherId) {
      // Create notification for teacher
      const notification = await Notification.create({
        specificId: teacherId,
        role: 'teacher',
        title: '❓ New Doubt Received',
        message: `${student.name} asked a doubt in ${course.courseName}: ${doubtTitle}`,
        type: 'doubt',
        referenceId: doubt.id,
      });

      // Send push notification to teacher
      await triggerPushForNotifications([notification]);
    }

    res.status(201).json({
      success: true,
      message: 'Doubt created successfully',
      data: doubt
    });

  } catch (error) {
    console.error('Error creating doubt:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateDoubt = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId, answerText } = req.body;

    // Validate required fields
    if (!teacherId || !answerText) {
      return res.status(400).json({
        success: false,
        message: 'teacherId and answerText are required'
      });
    }

    // Find the doubt
    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Check if already resolved
    if (doubt.isResolved) {
      return res.status(400).json({
        success: false,
        message: 'Doubt is already resolved and cannot be updated'
      });
    }

    // Fetch teacher name
    const teacher = await Teacher.findOne({
      where: { teacherId: teacherId },
      attributes: ['name']
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Update doubt
    await doubt.update({
      teacherId,
      teacherName: teacher.name,
      answerText,
      status: 'replied',
      repliedAt: new Date(),
      isResolved: true
    });

    // ================= NOTIFICATIONS (STUDENT) =================
    // Send notification to the specific student who asked this doubt
    if (doubt.studentId) {
      const notification = await Notification.create({
        specificId: doubt.studentId,
        role: 'student',
        title: '✅ Doubt Reply Received',
        message: `${teacher.name} replied to your doubt: ${doubt.doubtTitle}`,
        type: 'doubt',
        referenceId: doubt.id,
      });

      // Send push notification to the student
      await triggerPushForNotifications([notification]);
    }

    res.status(200).json({
      success: true,
      message: 'Doubt updated successfully',
      data: doubt
    });

  } catch (error) {
    console.error('Error updating doubt:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getDoubtsByCourseCode = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Validate required fields
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'teacherId is required'
      });
    }

    // console.log('Fetching doubts for teacherId:', teacherId);

    // Fetch doubts directly by teacherId from Doubt table
    const doubts = await Doubt.findAll({
      where: { teacherId: teacherId },
      order: [['createdAt', 'DESC']]
    });

    // console.log('Fetched doubts count:', doubts.length);

    res.status(200).json({
      success: true,
      message: 'Doubts fetched successfully',
      data: doubts
    });

  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getDoubtsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required'
      });
    }

    // console.log('Fetching doubts for studentId:', studentId);

    // Fetch all doubts for the student
    const doubts = await Doubt.findAll({
      where: { studentId: studentId },
      order: [['createdAt', 'DESC']]
    });

    // console.log('Fetched doubts count:', doubts.length);

    // Fetch student profile image from Student table
    const student = await Student.findOne({
      where: { studentId: studentId },
      attributes: ['profileImage']
    });

    const studentProfileImage = student ? student.profileImage : null;

    res.status(200).json({
      success: true,
      message: 'Doubts fetched successfully',
      data: doubts,
      studentProfileImage: studentProfileImage
    });

  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
