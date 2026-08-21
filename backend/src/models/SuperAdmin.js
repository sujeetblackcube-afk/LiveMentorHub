import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const SuperAdmin = sequelize.define('SuperAdmin', {
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'user_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'email',
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'otp',
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'otp_expires_at',
  },
  otpVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'otp_verified',
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'address',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    field: 'latitude',
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    field: 'longitude',
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'player_id',
  },
  deviceType: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: true,
    field: 'device_type',
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'mobile',
  },
  
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'profile_image',
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash',
  },
  role: {
    type: DataTypes.ENUM('superadmin'),
    defaultValue: 'superadmin',
    allowNull: false,
    field: 'role',
  },
}, {
  tableName: 'super_admins',
  timestamps: true,
  getterMethods: {
    lattitude() { return this.latitude; },
    Devicetype() { return this.deviceType; },
  },
  setterMethods: {
    lattitude(val) { this.setDataValue('latitude', val); },
    Devicetype(val) { this.setDataValue('deviceType', val); },
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['email'] },
    { fields: ['mobile'] }
  ]
});

// 2. SuperAdmin Login History Sub-Model
const SuperAdminLogin = sequelize.define('SuperAdminLogin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SuperAdmin,
      key: 'user_id',
    },
    field: 'user_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'email',
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mobile',
  },
  deviceType: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: true,
    field: 'device_type',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  attemptTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'attempt_time',
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILED'),
    allowNull: false,
    field: 'status',
  }
}, {
  tableName: 'superadmin_logins',
  timestamps: true,
  indexes: [
    { fields: ['user_id', 'attempt_time'] }
  ]
});

export {
  SuperAdminLogin
};

export default SuperAdmin;
