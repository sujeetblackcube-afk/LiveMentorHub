import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const Parent = sequelize.define('Parent', {
userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
 parentId : {
    type: DataTypes.STRING,
    primaryKey: true,
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false  
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
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
  status: {
    type: DataTypes.ENUM('APPROVED', 'SUSPENDED', 'TERMINATED'),
    defaultValue: 'APPROVED',
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
  type: DataTypes.STRING(20),
  defaultValue: "parent",
  allowNull: false,
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
  tableName: 'parents',
  timestamps: true
});

export default Parent;
