import Subscription from "../models/Subscription.js";
import SubscriptionBuyed from "../models/SubscriptionBuyed.js";
import { Teacher } from "../models/index.js";
import Cashfree, { createCashfreeClient } from "../utils/cashfree.js";
import pkg from 'sequelize';
const { Op } = pkg;
import { generateSubscriptionInvoicePDF } from "../utils/generateSubscriptionInvoicePDF.js";
import multer from "multer";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

// Helper function to upload PDF buffer to Cloudinary
const uploadPdfToS3 = async (buffer, fileName) => {
  try {
    const result = await uploadBufferToCloudinary(buffer, "teacherinvoice", "raw");
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading PDF to Cloudinary:", error);
    throw new Error("Failed to upload PDF");
  }
};

// Create a new subscription
export const createSubscription = async (req, res) => {
  try {
    const { planName, durationDays, CoursesAllowed, price, status } = req.body;

    // Required validation
    if (!planName || !durationDays || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Plan name, duration days, and price are required",
      });
    }

    const subscription = await Subscription.create({
      planName,
      durationDays,
      CoursesAllowed: CoursesAllowed || 0,
      price,
      status: status || "active",
    });
    

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all subscriptions
export const getAllSubscriptions = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const subscriptions = await Subscription.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Get All Subscriptions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get subscription by ID
export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Get Subscription By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update subscription
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Allowed fields to update
    const allowedFields = [
      "planName",
      "durationDays",
      "CoursesAllowed",
      "price",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body && req.body[field] !== undefined) {
        subscription[field] = req.body[field];
      }
    });

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Update Subscription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete subscription
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    await subscription.destroy();

    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subscription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// NOTE: For real purchases, use Cashfree flow + webhook. This endpoint is kept for admin/manual creation.
export const createSubscriptionCashfreeOrder = async (req, res) => {
  try {
    const { teacherId, planName, durationDays, startDate, endDate, orderId } = req.body;

    if (!teacherId || !planName) {
      return res.status(400).json({ success: false, message: "teacherId and planName are required" });
    }

    const subscriptionPlan = await Subscription.findOne({ where: { planName } });
    if (!subscriptionPlan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }

    const finalDurationDays = durationDays ?? subscriptionPlan.durationDays;

    if (!finalDurationDays || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "durationDays, startDate, and endDate are required",
      });
    }

    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const price = subscriptionPlan.price;
    const currency = process.env.CASHFREE_CURRENCY || "INR";
    const cfOrderId = `SUB_${Date.now()}_${teacherId}`;

    let returnBaseUrl = process.env.CASHFREE_RETURN_URL || process.env.FRONTEND_URL;
    if (!returnBaseUrl) {
      const origin = req.headers.origin || "http://localhost:5173";
      const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      returnBaseUrl = cleanOrigin.endsWith('/teacher') ? cleanOrigin : `${cleanOrigin}/teacher`;
    }
    const normalizedReturnUrl = returnBaseUrl.endsWith("/") ? returnBaseUrl : `${returnBaseUrl}/`;

    const request = {
      order_amount: Math.round(price),
      order_currency: currency.toUpperCase(),
      order_id: cfOrderId,
      customer_details: {
        customer_id: String(teacherId),
        customer_phone: teacher.mobile || "9999999999",
        customer_email: teacher.email || "teacher@example.com",
        customer_name: teacher.name || "Teacher"
      },
      order_meta: {
        return_url: `${normalizedReturnUrl}checkout-success?order_id={order_id}`
      },
      order_tags: {
        teacherId: String(teacherId),
        planName: String(planName),
        durationDays: String(finalDurationDays),
        startDate: String(startDate),
        endDate: String(endDate),
        orderId: orderId ? String(orderId) : "",
        type: "subscription",
      }
    };

    const client = createCashfreeClient();
    const response = await client.PGCreateOrder(request);

    return res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: cfOrderId,
      cf_mode: process.env.CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
    });
  } catch (error) {
    console.error("Create subscription cashfree order error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// Create a new subscription buyed (teacherId from params, other fields from body)
// NOTE: For real purchases, use Cashfree flow + webhook. This endpoint is kept for admin/manual creation.
export const createSubscriptionBuyed = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { planName, price, durationDays, startDate, endDate, orderId, status, paymentStatus, transactionId } = req.body;

    // Validate required fields
    if (!planName || price === undefined || !durationDays || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Plan name, price, duration days, start date, and end date are required",
      });
    }

    // Fetch teacher from Teacher table using teacherId
    const teacher = await Teacher.findOne({ where: { teacherId } });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const teacherName = teacher.name;

    const subscriptionBuyed = await SubscriptionBuyed.create({
      teacherId,
      teacherName,
      planName,
      price,
      durationDays,
      startDate,
      endDate,
      orderId: orderId || null,
      status: status || "active",
      paymentStatus: paymentStatus || "pending",
      transactionId: transactionId || null,
    });

    // Generate PDF invoice
    try {
      const pdfBuffer = await generateSubscriptionInvoicePDF(subscriptionBuyed, {
        name: process.env.COMPANY_NAME || "LiveMentorHub",
        email: process.env.COMPANY_EMAIL || "support@livementorhub.com",
        address: process.env.COMPANY_ADDRESS || "Nehru Place, New Delhi",
        phone: process.env.COMPANY_PHONE || "+91 0000000000",
        logoPath: process.env.COMPANY_LOGO_PATH || "uploads/company/logo.png",
      });

      // Generate unique filename for the PDF
      const pdfFileName = `subscription-invoice-${subscriptionBuyed.id}-${Date.now()}.pdf`;

      // Upload PDF to S3
      const pdfUrl = await uploadPdfToS3(pdfBuffer, pdfFileName);

      // Update subscription with PDF URL
      subscriptionBuyed.pdfUrl = pdfUrl;
      await subscriptionBuyed.save();
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
    }

    return res.status(201).json({
      success: true,
      message: "Subscription buyed created successfully",
      data: subscriptionBuyed,
    });
  } catch (error) {
    console.error("Create Subscription Buyed Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const expireActiveSubscriptionsIfNeeded = async () => {
  const now = new Date();
  // Mark any active subscription whose endDate is already passed as expired
  await SubscriptionBuyed.update(
    { status: "expired" },
    {
      where: {
        status: "active",
        endDate: { [Op.lt]: now },
      },
    }
  );
};

// Get subscription buyed by ID
export const getSubscriptionBuyedById = async (req, res) => {
  try {
    const { id } = req.params;

    await expireActiveSubscriptionsIfNeeded();

    const subscriptionBuyed = await SubscriptionBuyed.findByPk(id);

    if (!subscriptionBuyed) {
      return res.status(404).json({
        success: false,
        message: "Subscription buyed not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subscriptionBuyed,
    });
  } catch (error) {
    console.error("Get Subscription Buyed By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all subscriptions buyed by teacher ID
export const getSubscriptionsByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.params;

    await expireActiveSubscriptionsIfNeeded();

    const subscriptionsBuyed = await SubscriptionBuyed.findAll({
      where: { teacherId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: subscriptionsBuyed,
    });
  } catch (error) {
    console.error("Get Subscriptions By Teacher ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all subscriptions buyed (all records)
export const getAllSubscriptionsBuyed = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;

    await expireActiveSubscriptionsIfNeeded();

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const subscriptionsBuyed = await SubscriptionBuyed.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: subscriptionsBuyed,
    });
  } catch (error) {
    console.error("Get All Subscriptions Buyed Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cashfree webhook handler for subscription payments
export const cashfreeSubscriptionWebhook = async (req, res) => {
  try {
    const ts = req.headers["x-webhook-timestamp"];
    const signature = req.headers["x-webhook-signature"];
    const rawBody = req.body.toString('utf8');

    // Verify webhook signature (Cashfree SDK throws an error if invalid)
    Cashfree.PGVerifyWebhookSignature(signature, rawBody, ts);

    const event = typeof req.body === "string" ? JSON.parse(req.body) : JSON.parse(rawBody);

    if (event.type !== "PAYMENT_SUCCESS_WEBHOOK") {
      return res.status(200).json({ received: true });
    }

    const order = event.data.order;
    const payment = event.data.payment;

    // Validate metadata
    const tags = order.order_tags || {};
    if (tags.type !== "subscription") {
      console.error("❌ Subscription webhook: tags.type mismatch or missing", tags);
      return res.status(200).json({ received: true });
    }

    // Dedupe by Cashfree payment id
    const existing = await SubscriptionBuyed.findOne({
      where: { transactionId: payment.cf_payment_id.toString() },
    });

    if (existing) {
      return res.status(200).send("Already processed this payment");
    }

    const teacherId = tags.teacherId;
    const planName = tags.planName;
    const durationDays = parseInt(tags.durationDays || "0", 10);
    const startDate = tags.startDate;
    const endDate = tags.endDate;
    const orderId = tags.orderId || null;

    if (!teacherId || !planName || !durationDays || !startDate || !endDate) {
      console.error("Subscription webhook tags missing");
      return res.status(200).json({ received: true });
    }

    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      console.error("Teacher not found for subscription webhook", { teacherId });
      return res.status(200).json({ received: true });
    }

    const price = payment.payment_amount;

    const subscriptionBuyed = await SubscriptionBuyed.create({
      teacherId,
      teacherName: teacher.name,
      planName,
      price,
      durationDays,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      orderId: orderId ? String(orderId) : null,
      status: "active",
      paymentStatus: "paid",
      transactionId: payment.cf_payment_id.toString(),
    });

    try {
      const pdfBuffer = await generateSubscriptionInvoicePDF(subscriptionBuyed, {
        name: process.env.COMPANY_NAME || "LiveMentorHub",
        email: process.env.COMPANY_EMAIL || "support@livementorhub.com",
        address: process.env.COMPANY_ADDRESS || "Nehru Place, New Delhi",
        phone: process.env.COMPANY_PHONE || "+91 0000000000",
        logoPath: process.env.COMPANY_LOGO_PATH || "uploads/company/logo.png",
      });

      const pdfFileName = `subscription-invoice-${subscriptionBuyed.id}-${Date.now()}.pdf`;
      const pdfUrl = await uploadPdfToS3(pdfBuffer, pdfFileName);
      subscriptionBuyed.pdfUrl = pdfUrl;
      await subscriptionBuyed.save();
    } catch (pdfError) {
      console.error("Subscription invoice PDF generation failed:", pdfError);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Subscription webhook error:", err);
    return res.status(200).json({ received: true });
  }
};

export const getSubscriptionsWithTeacherStatus = async (req, res) => {
  try {
    const { teacherId } = req.params;

    await expireActiveSubscriptionsIfNeeded();

    // all subscriptions
    const allSubscriptions = await Subscription.findAll({
      order: [["createdAt", "DESC"]],
    });

    // teacher buyed subscriptions
    const buyedSubscriptions = await SubscriptionBuyed.findAll({
      where: { teacherId },
      order: [["createdAt", "DESC"]],
    });

    // purchased plan names
    const buyedPlanNames = [
      ...new Set(
        buyedSubscriptions.map((item) => item.planName)
      ),
    ];

    // only not purchased subscriptions
    const notBuyedSubscriptions = allSubscriptions.filter(
      (subscription) =>
        !buyedPlanNames.includes(subscription.planName)
    );

    return res.status(200).json({
      success: true,
      data: {
        buyedSubscriptions,
        notBuyedSubscriptions,
      },
    });
  } catch (error) {
    console.error(
      "Get Subscriptions With Teacher Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify Cashfree Subscription Order by orderId (Instant verification on return URL / redirect)
export const verifySubscriptionCashfreeOrder = async (req, res) => {
  try {
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

    // Check if subscription record already exists
    let existing = await SubscriptionBuyed.findOne({
      where: { orderId: String(orderId) },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Subscription already active",
        data: existing,
      });
    }

    const tags = order.order_tags || {};
    const teacherId = tags.teacherId || req.user?.teacherId;
    const planName = tags.planName;
    const durationDays = parseInt(tags.durationDays || "30", 10);
    const startDate = tags.startDate;
    const endDate = tags.endDate;

    if (!teacherId || !planName) {
      return res.status(400).json({ success: false, message: "Missing order metadata tags" });
    }

    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const price = order.order_amount;

    const subscriptionBuyed = await SubscriptionBuyed.create({
      teacherId,
      teacherName: teacher.name,
      planName,
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
      message: "Subscription verified and activated successfully!",
      data: subscriptionBuyed,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
      try {
        const existing = await SubscriptionBuyed.findOne({
          where: { orderId: String(req.params.orderId) },
        });
        if (existing) {
          return res.status(200).json({
            success: true,
            message: "Subscription verified and active",
            data: existing,
          });
        }
      } catch (findErr) {
        console.error("Error fetching existing subscription on constraint error:", findErr);
      }
    }
    console.error("Verify Cashfree order error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to verify order" });
  }
};

