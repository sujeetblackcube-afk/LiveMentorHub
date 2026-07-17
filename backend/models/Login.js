import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';
const Login = sequelize.define('Login', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Nullable to allow anonymous login attempts
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attemptTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  attemptCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // Default to 1 for the first attempt
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    allowNull: false,
  },
  failureReason: {
    type: DataTypes.ENUM('invalid_credentials', 'account_locked', 'other'),
    allowNull: true, // Nullable for successful logins
  },
  logoutTime: {
    type: DataTypes.DATE,
    allowNull: true, // Nullable for active sessions
  },
  sessionDuration: {
    type: DataTypes.INTEGER,
    allowNull: true, // Nullable until the session ends
  },
    playerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Devicetype: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('student', 'parent', 'teacher', 'superadmin'),
    allowNull: true,
  },
  specificId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  timestamps: false, // Disable automatic `createdAt` and `updatedAt` fields
});

export default Login;
