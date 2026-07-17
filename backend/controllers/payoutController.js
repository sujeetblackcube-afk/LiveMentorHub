import TeacherPayout from "../models/Payout.js";
import Teacher from "../models/Teacher.js";
import pkg from 'sequelize';
const { Op } = pkg;
import sequelize from "../config/db.js";

// Create a new payment/payout request
const createPayment = async (req, res) => {
  try {
    const { 
      teacherId, 
      amount, 
      paymentMethod, 
      remarks,
      transactionId,
      orderId,
      paidAt,
      status
    } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: "Teacher ID is required",
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: false,
        message: "Amount is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        status: false,
        message: "Payment method is required",
      });
    }

    if (status) {
      const allowedStatuses = ["pending", "processing", "paid", "failed"];
      if (!allowedStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          status: false,
          message: "Invalid status. Allowed: pending, processing, paid, failed",
        });
      }
    }

    const teacher = await Teacher.findOne({
      where: { teacherId },
      attributes: ["teacherId", "name"],
    });

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    let parsedPaidAt = null;
    if (paidAt) {
      parsedPaidAt = new Date(paidAt);
      if (isNaN(parsedPaidAt.getTime())) {
        return res.status(400).json({
          status: false,
          message: "Invalid paidAt date format",
        });
      }
    }

    const payoutStatus = status ? status : "pending";

    const payout = await TeacherPayout.create({
      teacherId,
      teacherName: teacher.name,
      amount,
      paymentMethod,
      status: payoutStatus,
      transactionId: transactionId || null,
      OrderId: orderId || null,
      remarks: remarks || null,
      requestedAt: new Date(),
      paidAt: parsedPaidAt,
    });

    return res.status(201).json({
      status: true,
      message: "Payment request created successfully",
      data: payout,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all payments with optional filtering
const getAllPayments = async (req, res) => {
  try {
    const { status, startDate, endDate, teacherId } = req.query;

    const whereClause = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (teacherId) {
      whereClause.teacherId = teacherId;
    }

    if (startDate && endDate) {
      whereClause.requestedAt = {
        [Op.between]: [
          new Date(`${startDate} 00:00:00`),
          new Date(`${endDate} 23:59:59`),
        ],
      };
    } else if (startDate) {
      whereClause.requestedAt = {
        [Op.gte]: new Date(`${startDate} 00:00:00`),
      };
    } else if (endDate) {
      whereClause.requestedAt = {
        [Op.lte]: new Date(`${endDate} 23:59:59`),
      };
    }

    const payouts = await TeacherPayout.findAll({
      where: whereClause,
      order: [["requestedAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Payments fetched successfully",
      data: payouts,
      count: payouts.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payout = await TeacherPayout.findByPk(id);

    if (!payout) {
      return res.status(404).json({
        status: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Payment fetched successfully",
      data: payout,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get total earnings for authenticated teacher
const getTotalEarningsByTeacher = async (req, res) => {
  try {
    const teacher = req.user;
    const teacherId = teacher.teacherId;

    const result = await TeacherPayout.findOne({
      where: {
        teacherId: teacherId,
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount']
      ],
      raw: true,
    });

    const totalEarnings = result?.totalAmount ? parseFloat(result.totalAmount) : 0;
    const transactionCount = result?.transactionCount ? parseInt(result.transactionCount) : 0;

    return res.status(200).json({
      status: true,
      message: "Total earnings fetched successfully",
      totalEarnings: totalEarnings,
      transactionCount: transactionCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get payout transactions for authenticated teacher
const getTeacherPayoutTransactions = async (req, res) => {
  try {
    const teacher = req.user;
    const teacherId = teacher.teacherId;
    const { status } = req.query;

    const whereClause = {
      teacherId: teacherId,
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const transactions = await TeacherPayout.findAll({
      where: whereClause,
      order: [["requestedAt", "DESC"]],
    });

    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return res.status(200).json({
      status: true,
      message: "Transactions fetched successfully",
      data: transactions,
      summary: {
        totalAmount: totalAmount,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export { createPayment, getAllPayments, getPaymentById, getTotalEarningsByTeacher, getTeacherPayoutTransactions };
