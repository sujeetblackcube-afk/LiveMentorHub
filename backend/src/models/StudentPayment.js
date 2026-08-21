import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Student from './Student.js';
import Enrollment from './Enrollment.js';
import Course from './Course.js';

const StudentPayment = sequelize.define(
  "StudentPayment",
  {
    orderId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'order_id',
    },
    cashfreeOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cashfree_order_id',
    },
    paymentSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'payment_session_id',
    },
    enrollmentCode: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Enrollment,
        key: 'enrollment_code',
      },
      field: 'enrollment_code',
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Student,
        key: 'student_id',
      },
      field: 'student_id',
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Course,
        key: 'course_code',
      },
      field: 'course_code',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'amount',
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR',
      field: 'currency',
    },
    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "USER_DROPPED", "REFUNDED"),
      defaultValue: "PENDING",
      allowNull: false,
      field: 'payment_status',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'payment_method',
    },
    bankReference: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'bank_reference',
    },
    transactionNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'transaction_number',
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_date',
    },
    isRefunded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_refunded',
    },
    refundedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'refunded_amount',
    },
    refundDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'refund_date',
    },
    rawWebhookPayload: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'raw_webhook_payload',
    },
  },
  {
    tableName: "student_payments",
    timestamps: true,
    indexes: [
      { fields: ['enrollment_code'] },
      { fields: ['student_id'] },
      { fields: ['course_code'] },
      { fields: ['payment_status'] },
      { fields: ['cashfree_order_id'] },
      { fields: ['transaction_number'] },
    ],
  }
);

export default StudentPayment;
