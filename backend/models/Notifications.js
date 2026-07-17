
import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';
const Notification = sequelize.define("Notification", {
  notificationId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  specificId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING, // student / teacher / parent
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.STRING, // assignment, payment, etc
  },
  referenceId: {
    type: DataTypes.STRING, // assignmentId, paymentId etc
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

export default Notification;