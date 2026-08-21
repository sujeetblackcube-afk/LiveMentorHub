import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Teacher from './Teacher.js';

const TeacherSubscription = sequelize.define(
  "TeacherSubscription",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id',
    },
    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Teacher,
        key: 'teacher_id',
      },
      field: 'teacher_id',
    },
    orderId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
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
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'plan_name',
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'price',
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_days',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date',
    },
    status: {
      type: DataTypes.ENUM("active", "expired", "cancelled"),
      defaultValue: "active",
      field: 'status',
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
      field: 'payment_status',
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'transaction_id',
    },
    rawWebhookPayload: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'raw_webhook_payload',
    },
  },
  {
    tableName: "teacher_subscriptions",
    timestamps: true,
    indexes: [
      { fields: ['teacher_id'] },
      { fields: ['order_id'] },
      { fields: ['cashfree_order_id'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
    ],
  }
);

export default TeacherSubscription;
