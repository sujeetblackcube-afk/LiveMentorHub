import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Teacher from "../models/Teacher.js";
import pkg from 'sequelize';
const { Op } = pkg;
import { getPaginatedData } from "../utils/pagination.js";
import { generateEnrollmentPDF } from "../utils/generateEnrollmentPDF.js";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import Cashfree, { createCashfreeClient } from "../utils/cashfree.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import Notification from "../models/Notifications.js";
import { triggerPushForNotifications } from "../config/onesignalService.js";
import crypto from "crypto";
import {notifySubscriptionConfirmation} from '../utils/notifySubscriptionEmail.js'
import SubscriptionBuyed from "../models/SubscriptionBuyed.js";

// Helper function to update total enrollment for a course
const updateTotalEnrollment = async (courseCode) => {
  try {
    const count = await Enrollment.count({
      where: { courseCode },
    });
    await Course.update({ totalenrollment: count }, { where: { courseCode } });
  } catch (error) {
    console.error("Error updating total enrollment:", error);
  }
};

// Helper function to generate course id globally
const generateEnrollmentId = async () => {
  // Find the maximum id across all course tables
  const lastCourse = await Enrollment.findOne({
    order: [["id", "DESC"]],
    attributes: ["id"],
  });

  let nextId = 1;
  if (lastCourse && lastCourse.id) {
    nextId = lastCourse.id + 1;
  }

  return nextId;
};

export const createEnrollment = async (req, res) => {
  try {
    const {
      studentId,
      courseCode,
      remarks,
      paymentStatus,
      transactionNumber,
      orderId,
      paymentMethod,
      amountPaid,
      currency,
      paymentDate,
    } = req.body;

    // Validation
    if (!studentId || !courseCode) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Course Code are required",
      });
    }

    // Check if student exists
    const student = await Student.findOne({ where: { studentId } });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if course exists
    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      where: { studentId, courseCode: course.courseCode },
    });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this course",
      });
    }

    // Generate enrollment code (ENR + YYYYMMDD + 4 digit)
    const prefix = "ENR";
    const today = new Date();
    const dateStr =
      today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");

    const lastEnrollment = await Enrollment.findOne({
      where: {
        enrollmentCode: {
          [Op.like]: `${prefix}${dateStr}%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    let nextNumber = 1;
    if (lastEnrollment) {
      const lastCode = lastEnrollment.enrollmentCode;
      const lastNumber = parseInt(
        lastCode.replace(`${prefix}${dateStr}`, ""),
        10,
      );
      nextNumber = lastNumber + 1;
    }

    const enrollmentCode = `${prefix}${dateStr}${String(nextNumber).padStart(4, "0")}`;

    // Enrollment start date
    const courseStartDate = new Date();

    let enrollmentExpireDate = null;
    if (
      course.courseDuration &&
      Number.isInteger(course.courseDuration) &&
      course.courseDuration > 0
    ) {
      enrollmentExpireDate = new Date(courseStartDate);
      enrollmentExpireDate.setDate(
        enrollmentExpireDate.getDate() + course.courseDuration + 30,
      );
    }

    const timestamp = Date.now();
    const finalTransactionNumber =
      transactionNumber && transactionNumber.trim() !== ""
        ? transactionNumber
        : `admin${timestamp}`;

    const finalOrderId =
      orderId && orderId.trim() !== "" ? orderId : `orderadmin${timestamp}`;

    const id = await generateEnrollmentId();

    const enrollment = await Enrollment.create({
      id,
      enrollmentCode,
      status: "APPROVED",
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      studentMobile: student.mobile,
      studentAddress: student.address,
      courseCode: course.courseCode,
      courseName: course.courseName,
      coursePrice: course.discountedprice,
      courseStartDate,
      enrollmentExpireDate,
      paymentStatus,
      transactionNumber: finalTransactionNumber,
      orderId: finalOrderId,
      paymentMethod,
      amountPaid,
      currency,
      paymentDate,
      remarks,
    });

    const pdfBuffer = await generateEnrollmentPDF(enrollment);
    const fileName = `${enrollment.enrollmentCode}-${uuidv4()}.pdf`;
    const pdfUrl = await uploadPdfToS3(pdfBuffer, fileName, enrollment.studentId);
    await enrollment.update({ pdfUrl });

    await updateTotalEnrollment(courseCode);

    return res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      data: enrollment,
      pdfUrl,
      enrollmentStatus: 1,
    });
  } catch (error) {
    console.error("Create Enrollment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Create Cashfree Order
export const createCashfreeOrder = async (req, res) => {
  try {
    const studentId = req.body.studentId || req.user?.studentId;
    const { courseCode } = req.body;

    if (!studentId || !courseCode) {
      return res
        .status(400)
        .json({ success: false, message: "studentId and courseCode are required" });
    }
    
    const student = await Student.findOne({ where: { studentId } });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const amount = req.body.amount || course.discountedprice || course.originalprice || 0;
    const currency = (req.body.currency || "INR").toUpperCase();

    const now = Date.now();
    const cfOrderId = `ENR_${now}_${studentId}`;

    let returnBaseUrl = process.env.CASHFREE_RETURN_URL || process.env.FRONTEND_URL;
    if (!returnBaseUrl) {
      if (req.headers.referer) {
        try {
          const refUrl = new URL(req.headers.referer);
          returnBaseUrl = refUrl.origin;
        } catch (e) {
          returnBaseUrl = req.headers.origin || "http://localhost:3000";
        }
      } else if (req.headers.origin) {
        returnBaseUrl = req.headers.origin;
      } else {
        returnBaseUrl = "http://localhost:3000";
      }
    }

    if (process.env.CASHFREE_ENV === "PRODUCTION" && returnBaseUrl.startsWith("http://")) {
      returnBaseUrl = returnBaseUrl.replace(/^http:\/\//i, "https://");
    }

    const normalizedReturnUrl = returnBaseUrl.endsWith("/") ? returnBaseUrl : `${returnBaseUrl}/`;

    const request = {
      order_amount: Math.round(amount),
      order_currency: (currency || "INR").toUpperCase(),
      order_id: cfOrderId,
      customer_details: {
        customer_id: String(studentId),
        customer_phone: student.mobile || "9999999999",
        customer_email: student.email || "student@example.com",
        customer_name: student.name || "Student"
      },
      order_meta: {
        return_url: `${normalizedReturnUrl}checkout-success?order_id={cfOrderId}`,
      },
      order_tags: {
        studentId: String(studentId),
        courseCode: String(courseCode),
        type: "enrollment"
      }
    };
    const client = createCashfreeClient();
    const response = await client.PGCreateOrder(request);

    // FIXED: Proper Date Math
    const nowDate = new Date();
    const courseDurationDays = Number(course.courseDuration) || 30; // fallback if missing
    const expireDate = new Date(nowDate.getTime() + courseDurationDays * 24 * 60 * 60 * 1000);

    console.log("making new enrollment record with orderId:", cfOrderId);
    const newEnrollment = await Enrollment.create({
      id: await generateEnrollmentId(),
      enrollmentCode: cfOrderId,
      enrollmentDate: nowDate,
      enrollmentExpireDate: expireDate, // Pass calculated Date object
      courseStartDate: nowDate,
      courseExpiryDate: expireDate,     // Pass calculated Date object

      status: "PENDING", // Best practice: keep as PENDING until webhook/payment verification succeeds

      // Student Snapshot
      studentId: student.studentId,
      studentName: student.name,
      studentEmail: student.email,
      studentMobile: student.mobile,
      studentAddress: student.address,
      teacherId: null,

      // Course Snapshot
      courseName: course.courseName,
      courseCode: course.courseCode,
      coursePrice: course.discountedprice || course.mrp,

      // Payment Details
      paymentStatus: "UNPAID",
      transactionNumber: null,
      orderId: cfOrderId || null,
      paymentMethod: null,
      paymentDate: nowDate,

      // Learning Tracking
      progress: 0,
      remarks: null,
    });

    res
      .status(200)
      .json({ 
        success: true, 
        payment_session_id: response.data.payment_session_id, 
        order_id: cfOrderId,
        cf_mode: process.env.CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox"
      });
  } catch (err) {
    
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    console.log("=== EXACT FIELD VALIDATION ERROR ===");
    err.errors.forEach(e => {
      console.log(`Field: ${e.path} | Error: ${e.message} | Value Sent: ${e.value}`);
    });
  } else {
    console.error("Cashfree create order error:", err);
  }
  // ... rest of error response





    // Enhanced error logging to capture exact Sequelize validation issues
    if (err.name === 'SequelizeValidationError') {
      console.error("Sequelize Validation Errors:", err.errors.map(e => ({ field: e.path, message: e.message })));
    } else {
      console.error("Cashfree create order error:", err.response?.data || err.message);
    }

    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message || "Internal server error"
    });
  }
};

// Verify Cashfree Enrollment Order by orderId (Instant verification on return URL / redirect)
export const verifyEnrollmentCashfreeOrder = async (req, res) => {
  try {
    console.log("Verifying Cashfree order for enrollment:", req.params.orderId);
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const client = createCashfreeClient();
    const response = await client.PGFetchOrder(orderId);
    const order = response.data;

    if (!order || order.order_status !== "PAID") {
      return res.status(400).json({
        success: false,
        message: `Order status is ${order?.order_status || "NOT PAID"}`,
        order_status: order?.order_status || "PENDING",
      });
    }

    // Check if enrollment record already exists
    let existing = await Enrollment.findOne({
      where: { orderId: String(orderId) },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Enrollment already exists for this order",
        data: existing,
      });
    } 

    const tags = order.order_tags || {};
    const studentId = tags.studentId || req.user?.studentId;
    const courseCode = tags.courseCode;
    const durationDays = parseInt(tags.durationDays || "30", 10);
    const startDate = tags.startDate;
    const endDate = tags.endDate;

    if (!studentId || !courseCode) {
      return res.status(400).json({ success: false, message: "Missing order metadata tags" });
    }

    const student = await Student.findOne({ where: { studentId } });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const price = order.order_amount;

    const enrollment = await Enrollment.create({
      studentId,
      courseCode,
      price,
      durationDays: durationDays || 30,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + (durationDays || 30) * 24 * 60 * 60 * 1000),
      orderId: String(orderId),
      status: "active",
      paymentStatus: "paid",
      transactionId: String(orderId),
    });

    return res.status(200).json({
      success: true,
      message: "Enrollment verified and activated successfully!",
      data: enrollment,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
      try {
        const existing = await Enrollment.findOne({
          where: { orderId: String(req.params.orderId) },
        });
        if (existing) {
          return res.status(200).json({
            success: true,
            message: "Enrollment verified and active",
            data: existing,
          });
        }
      } catch (findErr) {
        console.error("Error fetching existing enrollment on constraint error:", findErr);
      }
    }
    console.error("Verify Cashfree order error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to verify order" });
  }
};

export const cashfreeWebhook = async (req, res) => {
  try {
    const timestamp = req.headers["x-webhook-timestamp"];
    const receivedSignature = req.headers["x-webhook-signature"];

    if (!timestamp || !receivedSignature) {
      console.error("❌ Missing required Cashfree webhook headers");
      return res.status(400).json({ error: "Missing webhook headers" });
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body);

    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBody)
      .digest("base64");

    if (computedSignature !== receivedSignature) {
      console.error("❌ Cashfree Webhook Error: Signature mismatch");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = typeof req.body === "object" && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody);

    console.log("✅ Cashfree Webhook Received Successfully:");

    const eventType = event.type;
    const orderData = event.data?.order;
    const paymentData = event.data?.payment;
    const customerData = event.data?.customer_details;

    if (!orderData?.order_id) {
      return res.status(400).json({ error: "Order ID missing in webhook payload" });
    }

    const orderId = orderData.order_id;
    const transactionId = paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : null;

    // Handle Payment Success
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {

      // handle subscription 
      if(event.data.order.order_tags.type === "subscription") {
     
        const subscription = await SubscriptionBuyed.findOne({ where: { orderId } });

        if (!subscription) {
          console.error(`❌ Subscription record not found for Order ID: ${orderId}`);
          return res.status(404).json({ error: "Subscription record not found" });
        }

        console.log("Customer data",customerData);
        const userEmail = customerData.customer_email;

      await subscription.update({
        paymentStatus: "paid",
        transactionId: transactionId,
      });

      console.log(`🎉 Subscription updated to PAID for Order ID: ${orderId}`);

      // Invoke notification email with PDF invoice attached
      await notifySubscriptionConfirmation(subscription, userEmail);

      return res.status(200).json({ status: "success", message: "Payment processed successfully" });

      }

      else if(event.data.order.order_tags.type === "enrollment") {
        // Handle enrollment logic
        const enrollment = await Enrollment.findOne({ where: { orderId } });

        if (!enrollment) {
          console.error(`❌ Enrollment record not found for Order ID: ${orderId}`);
          return res.status(404).json({ error: "Enrollment record not found" });
        }

        const userEmail = customerData?.customer_email;

      await enrollment.update({
        paymentStatus: "PAID",
        transactionId: transactionId,
      });

      console.log(`🎉 Enrollment updated to PAID for Order ID: ${orderId}`);

      // Invoke notification email with PDF invoice attached
      await notifySubscriptionConfirmation(enrollment, userEmail);

      return res.status(200).json({ status: "success", message: "Payment processed successfully" });

      }

      else{
        return res.status(400).send(`Webhook received for orderId: ${orderId}, but type is not recognized. No action taken.`);
      }
    } 

    // Handle Payment Failure
    else if (eventType === "PAYMENT_FAILED_WEBHOOK" || eventType === "PAYMENT_DECLINED_WEBHOOK") {
      if(event.data.order.order_tags.type === "subscription") {
        const subscription = await SubscriptionBuyed.findOne({ where: { orderId } });

        if (!subscription) {
          console.error(`❌ Subscription record not found for Order ID: ${orderId}`);
          return res.status(404).json({ error: "Subscription record not found" });
        }

        await subscription.update({
          paymentStatus: "failed",
          transactionId: transactionId});

      console.log(`⚠️ Subscription updated to FAILED for Order ID: ${orderId}`);

      
      await notifySubscriptionConfirmation(subscription, userEmail);

      return res.status(200).json({ status: "success", message: "Payment failure handled successfully" });
      }

      else if(event.data.order.order_tags.type === "enrollment"){
        const enrollment = await Enrollment.findOne({ where: { orderId } });

        if (!enrollment) {
          console.error(`❌ Enrollment record not found for Order ID: ${orderId}`);
          return res.status(404).json({ error: "Enrollment record not found" });
        }

        await enrollment.update({
          paymentStatus: "FAILED",
          transactionId: transactionId
        });

        console.log(`⚠️ Enrollment updated to FAILED for Order ID: ${orderId}`);

        // Invoke notification email with PDF invoice attached
        await notifySubscriptionConfirmation(enrollment, userEmail);

        return res.status(200).json({ status: "success", message: "Payment failure handled successfully" });
      } 

      else {
        return res.status(4000).json({ error: "Webhook received but type is not recognized. No action taken." });
      }
    }

    return res.status(200).json({ 
      status: "ignored", 
      message: `Webhook received but event type '${eventType}' is not handled.` 
    });

  } catch (err) {
    console.error("❌ Cashfree Webhook Processing Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};


export const updateEnrollment = async (req, res) => {
  try {
    const { enrollmentCode } = req.params;
    const updateData = req.body;

    const enrollment = await Enrollment.findByPk(enrollmentCode);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Allowed fields to update
    const allowedFields = [
      "status",
      "isRefunded",
      "refundedAmount",
      "refundDate",
      "remarks",
      "paymentStatus",
      "enrollmentExpireDate",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        enrollment[field] = updateData[field];
      }
    });

    await enrollment.save();

    // Update total enrollment count
    await updateTotalEnrollment(enrollment.courseCode);

    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      data: enrollment,
    });
  } catch (error) {
    console.error("Update Enrollment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    const { enrollmentCode } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentCode);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    await enrollment.destroy();

    return res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Enrollment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAllEnrolledStudents = async (req, res) => {
  try {
    const { courseCode, studentId, status, paymentStatus, page, limit } = req.query;

    const where = {};
    if (courseCode) where.courseCode = courseCode;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const queryOptions = {
      where,
      order: [["createdAt", "DESC"]],
    };

    if (page) {
      const paginatedResult = await getPaginatedData(
        Enrollment,
        queryOptions,
        page,
        limit || 10
      );
      return res.status(200).json({
        success: true,
        data: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const enrollments = await Enrollment.findAll(queryOptions);

    return res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Get All Enrollments Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getEnrolledStudentById = async (req, res) => {
  try {
    const { enrollmentCode } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentCode);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Get Enrollment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getEnrollmentCount = async (req, res) => {
  try {
    // Get total count (all statuses)
    const totalCount = await Enrollment.count();

    // Get count by status
    const approvedCount = await Enrollment.count({
      where: { status: "APPROVED" },
    });

    const passoutCount = await Enrollment.count({
      where: { status: "PASSOUT" },
    });

    const pendingCount = await Enrollment.count({
      where: { status: "PENDING" },
    });

    return res.status(200).json({
      success: true,
      message: "Enrollment count fetched successfully",
      data: {
        total: totalCount,
        approved: approvedCount,
        passout: passoutCount,
        pending: pendingCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getEnrollmentCountByCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const count = await Enrollment.count({
      where: { courseCode },
    });
    return res.status(200).json({
      success: true,
      message: "Enrollment count by course fetched successfully",
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getEnrollmentCountThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const count = await Enrollment.count({
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });
    return res.status(200).json({
      success: true,
      message: "Enrollment count this month fetched successfully",
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getEnrollmentCountThisWeek = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const count = await Enrollment.count({
      where: {
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
    });
    return res.status(200).json({
      success: true,
      message: "Enrollment count this week fetched successfully",
      data: { count },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getEnrollmentDataThisWeek = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const data = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Enrollment.count({
        where: {
          createdAt: {
            [Op.between]: [dayStart, dayEnd],
          },
        },
      });

      const dayName = dayStart.toLocaleDateString("en-US", {
        weekday: "short",
      });
      data.push({ day: dayName, students: count });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment data this week fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getEnrollmentDataThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const data = [];
    const daysInMonth = endOfMonth.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(now.getFullYear(), now.getMonth(), i);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Enrollment.count({
        where: {
          createdAt: {
            [Op.between]: [dayStart, dayEnd],
          },
        },
      });

      data.push({ day: i.toString(), students: count });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment data this month fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSalesDataThisWeek = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const data = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const result = await Enrollment.sum("amountPaid", {
        where: {
          createdAt: {
            [Op.between]: [dayStart, dayEnd],
          },
          paymentStatus: "PAID",
        },
      });

      const amount = result || 0;
      const dayName = dayStart.toLocaleDateString("en-US", {
        weekday: "short",
      });
      data.push({ day: dayName, sales: amount });
    }

    return res.status(200).json({
      success: true,
      message: "Sales data this week fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSalesDataThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const data = [];
    const daysInMonth = endOfMonth.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(now.getFullYear(), now.getMonth(), i);
      dayEnd.setHours(23, 59, 59, 999);

      const result = await Enrollment.sum("amountPaid", {
        where: {
          createdAt: {
            [Op.between]: [dayStart, dayEnd],
          },
          paymentStatus: "PAID",
        },
      });

      const amount = result || 0;
      data.push({ day: i.toString(), sales: amount });
    }

    return res.status(200).json({
      success: true,
      message: "Sales data this month fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getTotalSalesThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const total = await Enrollment.sum("amountPaid", {
      where: {
        createdAt: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
        paymentStatus: "PAID",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Total sales this month fetched successfully",
      data: { total: total || 0 },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getTotalSalesThisWeek = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const total = await Enrollment.sum("amountPaid", {
      where: {
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
        paymentStatus: "PAID",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Total sales this week fetched successfully",
      data: { total: total || 0 },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ===========================================
// Update teacherId in enrollments
// ===========================================
export const updateTeacherIdInEnrollments = async (req, res) => {
  try {
    const { teacherId, studentId, studentIds, courseCode } = req.body;

    // Validation: At least teacherId is required
    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    // Build the where clause
    const whereClause = {};

    // If courseCode is provided, filter by course
    if (courseCode) {
      whereClause.courseCode = courseCode;
    }

    // If studentIds (array) is provided, update for multiple students
    // If studentId (single) is provided, update for that student
    // Otherwise, update all enrollments (or all for the course)
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      whereClause.studentId = { [Op.in]: studentIds };
    } else if (studentId) {
      whereClause.studentId = studentId;
    }

    // Update teacherId in enrollments
    const [updatedCount] = await Enrollment.update(
      { teacherId },
      { where: whereClause },
    );

    return res.status(200).json({
      success: true,
      message: studentIds
        ? `Teacher ID updated for ${updatedCount} students`
        : studentId
          ? `Teacher ID updated for student ${studentId}`
          : `Teacher ID updated for all enrollments`,
      data: { updatedCount },
    });
  } catch (error) {
    console.error("Update Teacher ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ===========================================
// Get enrollments by courseCode (for student dropdown)
// ===========================================
export const getEnrollmentsByCourseCode = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { status, paymentStatus } = req.query;

    if (!courseCode) {
      return res.status(400).json({
        success: false,
        message: "Course code is required",
      });
    }

    const where = { courseCode };

    // Add optional filters
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const enrollments = await Enrollment.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Enrollments fetched successfully",
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error) {
    console.error("Get Enrollments By Course Code Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ===========================================
// Get enrollments by teacherId
// ===========================================
export const getEnrollmentsByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status, paymentStatus, courseCode } = req.query;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const where = { teacherId };

    // Add optional filters
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (courseCode) where.courseCode = courseCode;

    const enrollments = await Enrollment.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Enrollments fetched successfully",
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error) {
    console.error("Get Enrollments By Teacher ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ===========================================
// Get enrollment count by teacherId (grouped)
// ===========================================
export const getEnrollmentCountByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.query;

    // If specific teacherId is provided, return count for that teacher
    if (teacherId) {
      const count = await Enrollment.count({
        where: { teacherId },
      });

      return res.status(200).json({
        success: true,
        message: `Enrollment count for teacher ${teacherId} fetched successfully`,
        data: { teacherId, count },
      });
    }

    // Otherwise, return count grouped by teacherId
    const enrollments = await Enrollment.findAll({
      attributes: [
        "teacherId",
        [
          Enrollment.sequelize.fn(
            "COUNT",
            Enrollment.sequelize.col("teacherId"),
          ),
          "count",
        ],
      ],
      where: {
        teacherId: {
          [Op.ne]: null, // Exclude null teacherIds
          [Op.ne]: "", // Exclude empty teacherIds
        },
      },
      group: ["teacherId"],
      raw: true,
    });

    // Get total count of enrollments with teacherId
    const totalWithTeacher = await Enrollment.count({
      where: {
        teacherId: {
          [Op.ne]: null,
          [Op.ne]: "",
        },
      },
    });

    // Get count of enrollments without teacherId
    const totalWithoutTeacher = await Enrollment.count({
      where: {
        [Op.or]: [{ teacherId: null }, { teacherId: "" }],
      },
    });

    return res.status(200).json({
      success: true,
      message: "Enrollment count by teacher fetched successfully",
      data: {
        byTeacher: enrollments,
        totalWithTeacher,
        totalWithoutTeacher,
        grandTotal: totalWithTeacher + totalWithoutTeacher,
      },
    });
  } catch (error) {
    console.error("Get Enrollment Count By Teacher ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ===========================================
// Get enrollments by studentId
// ===========================================
export const getEnrollmentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Fields to exclude from the response
    const excludedAttributes = [
      "courseExpiryDate",
      "isRefunded",
      "refundedAmount",
      "refundDate",
      "progress",
      "lastAccessedAt",
      "createdAt",
      "updatedAt"
    ];

    const enrollments = await Enrollment.findAll({
      where: { studentId },
      attributes: {
        exclude: excludedAttributes
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Enrollments fetched successfully",
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error) {
    console.error("Get Enrollments By Student ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ===========================================
// Cron job function: Update expired enrollments to PASSOUT
// ===========================================
export const updateExpiredEnrollments = async () => {
  try {
    const now = new Date();

    // Find all enrollments where enrollmentExpireDate has passed and status is not already PASSOUT
    const expiredEnrollments = await Enrollment.findAll({
      where: {
        enrollmentExpireDate: {
          [Op.lt]: now, // enrollmentExpireDate is less than current date
        },
        status: {
          [Op.ne]: "PASSOUT", // status is not already PASSOUT
        },
      },
    });

    if (expiredEnrollments.length > 0) {
      // Get the enrollment codes for logging
      const expiredCodes = expiredEnrollments.map((e) => e.enrollmentCode);

      // Update all expired enrollments to PASSOUT status
      const [updatedCount] = await Enrollment.update(
        { status: "PASSOUT" },
        {
          where: {
            enrollmentExpireDate: {
              [Op.lt]: now,
            },
            status: {
              [Op.ne]: "PASSOUT",
            },
          },
        },
      );

      // console.log(
      //  `[Cron] Updated ${updatedCount} enrollments to PASSOUT status at ${now.toISOString()}`,
      // );
      // console.log(`[Cron] Expired enrollment codes:`, expiredCodes);
      return updatedCount;
    }

    // console.log(`[Cron] No expired enrollments found at ${now.toISOString()}`);
    return 0;
  } catch (error) {
    console.error("[Cron] Error updating expired enrollments:", error);
    throw error;
  }
};
