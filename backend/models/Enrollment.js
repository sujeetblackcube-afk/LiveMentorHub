import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    // =======================
    // Enrollment Identity
    // =======================
    enrollmentCode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true,
    },

    enrollmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    enrollmentExpireDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "PASSOUT"),
      defaultValue: "APPROVED",
      allowNull: false,
    },
    pdfUrl: {
  type: DataTypes.TEXT,
  allowNull: true,
},

    // =======================
    // Student Snapshot
    // =======================
    studentId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    studentName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    studentEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    studentMobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    studentAddress: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    teacherId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // =======================
    // Course Snapshot
    // =======================

    courseName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    courseCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    coursePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    // =======================
    // Course Validity
    // =======================
    courseStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    courseExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // =======================
    // Payment Details
    // =======================
    paymentStatus: {
      type: DataTypes.STRING(20),
      defaultValue: "UNPAID",
      // PAID | UNPAID | FAILED | REFUNDED
    },

    transactionNumber: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    orderId: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    paymentMethod: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "INR",
    },

    paymentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    isRefunded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    refundedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    refundDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // =======================
    // Learning Tracking
    // =======================
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "enrollments",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["studentId", "courseCode"],
      },
    ],
    // Removed unique index on studentId/courseCode to allow multiple enrollments
    // for the same student in the same course (e.g., renewed enrollments)
  },
);

export default Enrollment;
