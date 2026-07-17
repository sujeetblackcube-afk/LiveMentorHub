import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const SubscriptionBuyed = sequelize.define(
  "SubscriptionBuyed",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    teacherName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    orderId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },

    planName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },


    // 🔥 This handles 15 days / 30 days / 90 days etc.
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "expired", "cancelled"),
      defaultValue: "active",
    },

    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pdfUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "subscription_buyed",
    timestamps: true,
  }
);

export default SubscriptionBuyed;