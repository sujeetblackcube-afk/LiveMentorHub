import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;
import LiveSession from "../models/Livesession.js";
import SequelizePkg from "sequelize";
const { Op } = SequelizePkg;
import Course from "../models/Course.js";
import Teacher from "../models/Teacher.js";
import Enrollment from "../models/Enrollment.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

const convertLocalToUTC = (dateString) => {
  if (!dateString) return null;

  // If already an ISO string with Z or timezone offset (e.g. Z or +05:30)
  if (typeof dateString === "string" && (dateString.endsWith("Z") || dateString.match(/[+-]\d{2}:\d{2}$/))) {
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? dateString : d.toISOString();
  }

  // If datetime-local string without offset (e.g. "2026-07-19T08:55"), parse as IST (+05:30)
  let cleanStr = String(dateString).trim();
  if (cleanStr.includes("T") && !cleanStr.match(/[+-]\d{2}:\d{2}$/)) {
    if (cleanStr.length === 16) cleanStr += ":00";
    cleanStr += "+05:30";
  }

  const parsed = new Date(cleanStr);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date(dateString);
    return Number.isNaN(fallback.getTime()) ? dateString : fallback.toISOString();
  }

  return parsed.toISOString();
};

// Helper function to generate Agora token
const generateAgoraToken = (channelName, uid, role, endTime) => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  
  if (!appId || !appCertificate) {
    return { appId: null, token: null, uid: null };
  }
  
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);
  const expirationTimeInSeconds = endTimestamp - currentTimestamp;
  
  if (expirationTimeInSeconds <= 0) {
    return { appId, token: null, uid };
  }
  
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs,
  );
  
  return { appId, token, uid };
};

// Helper function to create a single session
const createSingleSession = async (sessionData, course, teacher, thumbnailPath) => {
  const {
    courseCode,
    teacherId,
    title,
    description,
    startTime,
    endTime,
    maxParticipants,
    isPrivate,
  } = sessionData;

  // Convert local IST time to UTC before storing in database
  const utcStartTime = convertLocalToUTC(startTime);
  const utcEndTime = convertLocalToUTC(endTime);

  // Determine status based on converted UTC startTime
  const currentTime = new Date();
  const sessionStartTime = new Date(utcStartTime);
  let status = "upcoming";
  if (sessionStartTime <= currentTime) {
    status = "ongoing";
  }

  // Generate unique sessionId
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const channelName = `live_${courseCode}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Generate Agora token
  const uid = Math.floor(Date.now() % 1000000000);
  const { appId, token } = generateAgoraToken(
    channelName,
    uid,
    RtcRole.PUBLISHER,
    utcEndTime
  );

  if (!appId) {
    throw new Error("Agora App ID not configured");
  }

  const newSession = await LiveSession.create({
    sessionId,
    courseName: course.courseName,
    courseCode,
    teacherId,
    teacherName: teacher.name,
    title,
    description,
    thumbnailUrl: thumbnailPath,
    startTime: utcStartTime,
    endTime: utcEndTime,
    status,
    platform: 'Agora',
    appId,
    channelName,
    token,
    uid: uid ? uid.toString() : null,
    maxParticipants: parseInt(maxParticipants || 100, 10),
    isPrivate,
  });

  return newSession;
};

// Helper function to generate session dates based on schedule type
const generateSessionDates = (scheduleType, startDate, selectedDays, duration) => {
  const dates = [];
  const start = new Date(startDate);
  const dayOfWeekMap = {
    '0': 0, // Sunday
    '1': 1, // Monday
    '2': 2, // Tuesday
    '3': 3, // Wednesday
    '4': 4, // Thursday
    '5': 5, // Friday
    '6': 6, // Saturday
    '7': 0, // Sunday (alternative)
  };

  if (scheduleType === 'single') {
    dates.push(new Date(start));
  } else if (scheduleType === 'weekly') {
    // selectedDays is an array of day indices (0-6, Sunday-Saturday)
    const weeks = parseInt(duration) || 1;
    for (let week = 0; week < weeks; week++) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      
      for (const day of selectedDays) {
        const sessionDate = new Date(weekStart);
        const dayIndex = dayOfWeekMap[day.toString()] !== undefined ? dayOfWeekMap[day.toString()] : parseInt(day);
        const currentDay = sessionDate.getDay();
        const diff = dayIndex - currentDay;
        sessionDate.setDate(sessionDate.getDate() + diff);
        
        // Only add future dates
        if (sessionDate >= new Date()) {
          dates.push(new Date(sessionDate));
        }
      }
    }
  } else if (scheduleType === 'monthly') {
    // selectedDays is an array of day numbers (1-31)
    const months = parseInt(duration) || 1;
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    
    for (let month = 0; month < months; month++) {
      const currentMonth = new Date(startYear, startMonth + month, 1);
      for (const day of selectedDays) {
        const dayNum = parseInt(day);
        // Handle months with fewer days
        const maxDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const actualDay = Math.min(dayNum, maxDay);
        const sessionDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), actualDay);
        
        // Only add future dates
        if (sessionDate >= new Date()) {
          dates.push(new Date(sessionDate));
        }
      }
    }
  } else if (scheduleType === 'yearly') {
    // selectedDays is an array of day numbers (1-31) for each month
    const months = parseInt(duration) || 1;
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    
    for (let month = 0; month < months; month++) {
      const currentDate = new Date(startYear, startMonth + month, 1);
      for (const day of selectedDays) {
        const dayNum = parseInt(day);
        // Handle months with fewer days
        const maxDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const actualDay = Math.min(dayNum, maxDay);
        const sessionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), actualDay);
        
        // Only add future dates
        if (sessionDate >= new Date()) {
          dates.push(new Date(sessionDate));
        }
      }
    }
  }

  return dates;
};

export const createLiveSession = async (req, res) => {
  try {
    // console.log("Request body:", req.body);
    // console.log("Request file:", req.file);

    // Check if it's a bulk creation request
    const isBulkRequest = req.body.sessions && Array.isArray(JSON.parse(req.body.sessions));
    
    if (isBulkRequest) {
      return createBulkLiveSessions(req, res);
    }

    // Single session creation (existing logic)
    const {
      courseCode,
      teacherId,
      title,
      description,
      startTime,
      endTime,
      maxParticipants,
      isPrivate = false,
    } = req.body;

    // Handle thumbnail upload
    let thumbnailPath = null;
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "online_class_thumbnails");
        thumbnailPath = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "Error uploading thumbnail" });
      }
    }

    // Fetch courseName from Course table using courseCode
    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Fetch teacherName from Teacher table using teacherId
    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    const newSession = await createSingleSession(
      {
        courseCode,
        teacherId,
        title,
        description,
        startTime,
        endTime,
        maxParticipants,
        isPrivate,
      },
      course,
      teacher,
      thumbnailPath
    );

    // Update all sessions' statuses based on current time after creation
    const LiveSessionModel = LiveSession;

    // Update upcoming to ongoing
    await LiveSessionModel.update(
      { status: "ongoing" },
      {
        where: {
          status: "upcoming",
          startTime: {
            [Op.lte]: new Date(),
          },
        },
      },
    );

    // Update ongoing to completed
    await LiveSessionModel.update(
      { status: "completed" },
      {
        where: {
          status: "ongoing",
          endTime: {
            [Op.lte]: new Date(),
          },
        },
      },
    );

    // After single live session creation, send scheduled notification to enrolled students
    // who match BOTH teacherId and courseCode and are APPROVED.
    try {
      const enrollments = await Enrollment.findAll({
        where: {
          courseCode: newSession.courseCode,
          teacherId: newSession.teacherId,
          status: "APPROVED",
        },
        attributes: ["studentId"],
      });

      const studentIds = [...new Set(enrollments.map((e) => e.studentId))].filter(Boolean);

      if (studentIds.length > 0) {
        const notificationsPayload = studentIds.map((studentId) => ({
          specificId: studentId,
          role: "student",
          title: "📺 Live class scheduled",
          message: `A live class is scheduled for ${newSession.courseName}. Start at ${new Date(newSession.startTime).toISOString()}.`,
          type: "live_session_scheduled",
          referenceId: newSession.sessionId,
        }));

        const createdNotifications = await Notification.bulkCreate(
          notificationsPayload,
          { returning: true }
        );

        await triggerPushForNotifications(createdNotifications);
      }
    } catch (pushError) {
      console.error("Scheduled live notification (single) failed:", pushError);
    }

    res.status(201).json({ success: true, session: newSession });
  } catch (error) {
    console.error("Error creating live session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk session creation handler
const createBulkLiveSessions = async (req, res) => {
  try {
    // console.log("Bulk session request body:", req.body);
    
    const sessions = JSON.parse(req.body.sessions);
    const {
      courseCode,
      teacherId,
      maxParticipants,
      isPrivate = false,
      scheduleType,
      startDate,
      selectedDays,
      duration,
    } = req.body;

    // Handle thumbnail upload
    let thumbnailPath = null;
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "online_class_thumbnails");
        thumbnailPath = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "Error uploading thumbnail" });
      }
    }

    // Fetch course
    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Fetch teacher
    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    // Determine which sessions to create
    let sessionsToCreate = [];
    
    // Check if sessions array is provided directly (from frontend calendar-based scheduling)
    if (sessions && Array.isArray(sessions) && sessions.length > 0) {
      // Use the sessions array directly provided by frontend
      sessionsToCreate = sessions.map(session => ({
        title: session.title,
        description: session.description || '',
        startTime: session.startTime,
        endTime: session.endTime,
      }));
    } else {
      // Fallback to the old schedule-based generation
      // Get base times from first session
      const baseSession = sessions && sessions.length > 0 ? sessions[0] : {};
      const baseStartTime = new Date(baseSession.startTime || startDate);
      const baseEndTime = new Date(baseSession.endTime || startDate);
      
      // Calculate duration of each session
      const sessionDuration = baseEndTime.getTime() - baseStartTime.getTime();
      
      // Get hours and minutes from base start time
      const baseHours = baseStartTime.getHours();
      const baseMinutes = baseStartTime.getMinutes();

      // Generate session dates
      const sessionDates = generateSessionDates(
        scheduleType || 'weekly',
        startDate || baseSession.startTime,
        selectedDays ? JSON.parse(selectedDays) : [],
        duration || 1
      );

      // console.log("Generated session dates:", sessionDates);

      // Create sessions for each date
      for (const date of sessionDates) {
        // Set the time for this session
        const sessionStart = new Date(date);
        sessionStart.setHours(baseHours, baseMinutes, 0, 0);
        
        const sessionEnd = new Date(sessionStart.getTime() + sessionDuration);

        sessionsToCreate.push({
          title: baseSession.title,
          description: baseSession.description,
          startTime: sessionStart.toISOString(),
          endTime: sessionEnd.toISOString(),
        });
      }
    }

    // Create sessions for each date
    const createdSessions = [];
    for (const sessionData of sessionsToCreate) {
      try {
        const newSession = await createSingleSession(
          {
            courseCode,
            teacherId,
            title: sessionData.title,
            description: sessionData.description,
            startTime: sessionData.startTime,
            endTime: sessionData.endTime,
            maxParticipants,
            isPrivate,
          },
          course,
          teacher,
          thumbnailPath
        );
        createdSessions.push(newSession);
      } catch (sessionError) {
        console.error("Error creating session for date:", sessionData, sessionError);
        // Continue creating other sessions even if one fails
      }
    }

    // Update all sessions' statuses based on current time after creation
    const LiveSessionModel = LiveSession;

    // Update upcoming to ongoing
    await LiveSessionModel.update(
      { status: "ongoing" },
      {
        where: {
          status: "upcoming",
          startTime: {
            [Op.lte]: new Date(),
          },
        },
      },
    );

    // Update ongoing to completed
    await LiveSessionModel.update(
      { status: "completed" },
      {
        where: {
          status: "ongoing",
          endTime: {
            [Op.lte]: new Date(),
          },
        },
      },
    );

    // After bulk creation, send notifications for each scheduled session created
    // to ONLY enrolled approved students of that course.
    if (createdSessions.length > 0) {
      // Fetch approved enrolled students once per courseCode
      const enrollments = await Enrollment.findAll({
        where: {
          courseCode,
          teacherId,
          status: "APPROVED",
        },
        attributes: ["studentId"],
      });

      const studentIds = [...new Set(enrollments.map((e) => e.studentId))].filter(Boolean);

      if (studentIds.length > 0) {
        for (const sess of createdSessions) {
          const notificationsPayload = studentIds.map((studentId) => ({
            specificId: studentId,
            role: "student",
            title: "📺 Live class scheduled",
            message: `A live class is scheduled for ${sess.courseName}. Start at ${new Date(sess.startTime).toISOString()}.`,
            type: "live_session_scheduled",
            referenceId: sess.sessionId,
          }));

          const createdNotifications = await Notification.bulkCreate(
            notificationsPayload,
            { returning: true }
          );

          await triggerPushForNotifications(createdNotifications);
        }
      }
    }

    res.status(201).json({ 
      success: true, 
      sessions: createdSessions,
      count: createdSessions.length
    });
  } catch (error) {
    console.error("Error creating bulk live sessions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const startLiveSession = async (req, res) => {
  try {
    const { sessionId, teacherId } = req.body;

    const session = await LiveSession.findOne({ where: { sessionId } });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.teacherId !== teacherId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Session already completed",
      });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return res.status(500).json({
        success: false,
        message: "Agora credentials not configured",
      });
    }

    // Generate fresh UID
    const uid = parseInt(session.uid, 10);
    const role = RtcRole.PUBLISHER;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const endTimestamp = Math.floor(new Date(session.endTime).getTime() / 1000);

    const expirationTimeInSeconds = endTimestamp - currentTimestamp;
    if (expirationTimeInSeconds <= 0) {
      return res.status(400).json({
        success: false,
        message: "Session end time already passed",
      });
    }

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

 const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      session.channelName,
      uid,
      role,
      privilegeExpiredTs,
    );

    await session.update({
      status: "ongoing",
      token,
    });

    res.json({
      success: true,
      appId,
      channelName: session.channelName,
      uid,
      token,
    });
  } catch (error) {
    console.error("Start live error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLiveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await LiveSession.findOne({ where: { sessionId } });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    const {
      courseCode,
      title,
      description,
      startTime,
      endTime,
      maxParticipants,
      isPrivate,
    } = req.body;

    // If courseCode changes, fetch and update courseName
    if (courseCode && courseCode !== session.courseCode) {
      const course = await Course.findOne({ where: { courseCode } });
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }
      session.courseName = course.courseName;
      session.courseCode = courseCode;
    }

    // Update other fields
    if (title !== undefined) session.title = title;
    if (description !== undefined) session.description = description;
    
    // Convert local time to UTC when updating startTime and endTime
    if (startTime !== undefined) {
      session.startTime = convertLocalToUTC(startTime);
    }
    if (endTime !== undefined) {
      session.endTime = convertLocalToUTC(endTime);
    }
    
    if (maxParticipants !== undefined)
      session.maxParticipants = maxParticipants;
    if (isPrivate !== undefined) session.isPrivate = isPrivate;

    // Handle thumbnail upload
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, "online_class_thumbnails");
        session.thumbnailUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: "Error uploading thumbnail" });
      }
    }

    // Update status based on new startTime and endTime
    const currentTime = new Date();
    const sessionStartTime = new Date(session.startTime);
    const sessionEndTime = new Date(session.endTime);
    if (currentTime >= sessionStartTime && currentTime <= sessionEndTime) {
      session.status = "ongoing";
    } else if (currentTime > sessionEndTime) {
      session.status = "completed";
    } else {
      session.status = "upcoming";
    }

    // Regenerate Agora token if startTime or endTime changed
    if (startTime !== undefined || endTime !== undefined) {
      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;
      if (appId && appCertificate) {
        const uid = parseInt(session.uid, 10);
        const role = RtcRole.PUBLISHER;
        const expirationTimeInSeconds = Math.floor(
          (new Date(session.endTime) - Date.now()) / 1000,
        );
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        session.token = RtcTokenBuilder.buildTokenWithUid(
          appId,
          appCertificate,
          session.channelName,
          uid,
          role,
          privilegeExpiredTs,
        );
      }
    }

    await session.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Session updated successfully",
        session,
      });
  } catch (error) {
    console.error("Error updating live session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const joinLiveSession = async (req, res) => {
  try {
    const { sessionId, studentId } = req.body;

    // Find the live session by sessionId
    const session = await LiveSession.findOne({
      where: {
        sessionId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Session has already completed",
      });
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: {
        studentId,
        courseCode: session.courseCode,
        status: "APPROVED", // Assuming only approved enrollments can join
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "Student is not enrolled in this course or enrollment is not approved",
      });
    }

    // Generate Agora token for student (subscriber role)
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return res.status(500).json({
        success: false,
        message: "Agora credentials not configured",
      });
    }

    // Generate UID for student
    const uid = Math.floor(Date.now() % 1000000000);
    const role = RtcRole.SUBSCRIBER; // Student is subscriber

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const endTimestamp = Math.floor(new Date(session.endTime).getTime() / 1000);

    const expirationTimeInSeconds = endTimestamp - currentTimestamp;
    if (expirationTimeInSeconds <= 0) {
      return res.status(400).json({
        success: false,
        message: "Session has already ended",
      });
    }

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      session.channelName,
      uid,
      role,
      privilegeExpiredTs,
    );

    // Increment total students joined
    await session.increment("totalStudentsJoined");

    res.json({
      success: true,
      appId,
      channelName: session.channelName,
      uid,
      token,
      sessionId: session.sessionId,
      title: session.title,
      teacherName: session.teacherName,
      teacherUid: session.uid ? parseInt(session.uid, 10) : null,
    });
  } catch (error) {
    console.error("Join live session error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Automatically update LiveSession statuses based on time
// - startTime <= now  => ongoing
// - endTime   <= now  => completed
export const updateLiveSessionStatuses = async () => {
  try {
    const now = new Date();
    // Using static LiveSession import since we moved it to top
    const LiveSessionModel = LiveSession;

    // Update upcoming -> ongoing (inclusive boundary)
    await LiveSessionModel.update(
      { status: "ongoing" },
      {
        where: {
          status: "upcoming",
          startTime: { [Op.lte]: now },
        },
      },
    );

    // Update ongoing -> completed (inclusive boundary)
    await LiveSessionModel.update(
      { status: "completed" },
      {
        where: {
          status: "ongoing",
          endTime: { [Op.lte]: now },
        },
      },
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating live session statuses:", error);
    return { success: false, error };
  }
};

export const teacherCreateLiveClassTotal = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    // Count total live sessions created by the teacher
    const totalSessions = await LiveSession.count({
      where: { teacherId },
    });
    
  // Optionally, get breakdown by status
    const upcomingCount = await LiveSession.count({
      where: { teacherId, status: "upcoming" },
    });

    const ongoingCount = await LiveSession.count({
      where: { teacherId, status: "ongoing" },
    });

    const completedCount = await LiveSession.count({
      where: { teacherId, status: "completed" },
    });

    res.status(200).json({
      success: true,
      total: totalSessions,
    });
  } catch (error) {
    console.error("Error fetching teacher live class total:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLiveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { teacherId } = req.body;

    const session = await LiveSession.findOne({ where: { sessionId } });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    // Verify that the teacher owns this session
    if (session.teacherId !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not authorized to delete this session" 
      });
    }

    // Delete the session
    await session.destroy();

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting live session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


