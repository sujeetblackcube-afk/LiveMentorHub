import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const SuperAdmin = sequelize.define('SuperAdmin', {
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
   otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  otpVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false  
  },
  lattitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,  
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Devicetype: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('superadmin'),
    defaultValue: 'superadmin',
    allowNull: false
  },

  activeWebToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  activeAppToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'superadmins',
  timestamps: true
});
export default SuperAdmin;

