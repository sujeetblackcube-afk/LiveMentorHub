import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

// 1. Core Parent Identity Model
const Parent = sequelize.define('Parent', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
  },
  parentId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    field: 'parent_id',
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
    allowNull: false,
    field: 'mobile',
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'address',
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'country',
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
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'profile_image',
  },
  status: {
    type: DataTypes.ENUM('APPROVED', 'SUSPENDED', 'TERMINATED'),
    defaultValue: 'APPROVED',
    allowNull: false,
    field: 'status',
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: "parent",
    allowNull: false,
    field: 'role',
  },
}, {
  tableName: 'parents',
  timestamps: true,
  getterMethods: {
    lattitude() { return this.latitude; },
  },
  setterMethods: {
    lattitude(val) { this.setDataValue('latitude', val); },
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['email'] },
    { fields: ['mobile'] },
    { fields: ['status'] }
  ]
});

// 2. Parent Tech & Auth Detail Sub-Model
const ParentTechDetail = sequelize.define('ParentTechDetail', {
  parentId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Parent,
      key: 'parent_id',
    },
    field: 'parent_id',
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash',
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
}, {
  tableName: 'parent_tech_details',
  timestamps: true,
  getterMethods: {
    Devicetype() { return this.deviceType; },
  },
  setterMethods: {
    Devicetype(val) { this.setDataValue('deviceType', val); },
  },
  indexes: [
    { fields: ['parent_id'] },
    { fields: ['player_id'] },
    { fields: ['device_type'] }
  ]
});

// 3. Parent Notifications Sub-Model
const ParentNotification = sequelize.define('ParentNotification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Parent,
      key: 'parent_id',
    },
    field: 'parent_id',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'GENERAL',
    field: 'type',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  }
}, {
  tableName: 'parent_notifications',
  timestamps: true,
  indexes: [
    { fields: ['parent_id', 'is_read'] },
    { fields: ['type'] }
  ]
});

// 4. Parent Login History Sub-Model
const ParentLogin = sequelize.define('ParentLogin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Parent,
      key: 'parent_id',
    },
    field: 'parent_id',
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
  tableName: 'parent_logins',
  timestamps: true,
  indexes: [
    { fields: ['parent_id', 'attempt_time'] }
  ]
});

// 5. Parent Support Ticket Sub-Model
const ParentSupportTicket = sequelize.define('ParentSupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Parent,
      key: 'parent_id',
    },
    field: 'parent_id',
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
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'subject',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RESOLVED'),
    defaultValue: 'PENDING',
    field: 'status',
  }
}, {
  tableName: 'parent_support_tickets',
  timestamps: true,
  indexes: [
    { fields: ['parent_id'] },
    { fields: ['status'] }
  ]
});

export {
  ParentTechDetail,
  ParentNotification,
  ParentLogin,
  ParentSupportTicket
};

export default Parent;
