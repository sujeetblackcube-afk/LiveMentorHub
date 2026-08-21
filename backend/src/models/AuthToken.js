import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Parent from './Parent.js';
import SuperAdmin from './SuperAdmin.js';

// 1. Student Dual-Token Session Model
export const StudentToken = sequelize.define('StudentToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
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
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'access_token',
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'refresh_token',
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'device_type',
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'player_id',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
}, {
  tableName: 'student_tokens',
  timestamps: true,
  indexes: [
    { fields: ['student_id', 'is_revoked'] },
    { fields: ['refresh_token'] },
  ],
});

// 2. Teacher Dual-Token Session Model
export const TeacherToken = sequelize.define('TeacherToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'access_token',
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'refresh_token',
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'device_type',
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'player_id',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
}, {
  tableName: 'teacher_tokens',
  timestamps: true,
  indexes: [
    { fields: ['teacher_id', 'is_revoked'] },
    { fields: ['refresh_token'] },
  ],
});

// 3. Parent Dual-Token Session Model
export const ParentToken = sequelize.define('ParentToken', {
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
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'access_token',
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'refresh_token',
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'device_type',
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'player_id',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
}, {
  tableName: 'parent_tokens',
  timestamps: true,
  indexes: [
    { fields: ['parent_id', 'is_revoked'] },
    { fields: ['refresh_token'] },
  ],
});

// 4. Admin Dual-Token Session Model
export const AdminToken = sequelize.define('AdminToken', {
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
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'access_token',
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'refresh_token',
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'device_type',
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'player_id',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
}, {
  tableName: 'admin_tokens',
  timestamps: true,
  indexes: [
    { fields: ['user_id', 'is_revoked'] },
    { fields: ['refresh_token'] },
  ],
});

// 5. Institute Dual-Token Session Model (Future Ready)
export const InstituteToken = sequelize.define('InstituteToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'access_token',
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'refresh_token',
  },
  deviceType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'device_type',
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'player_id',
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_revoked',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
}, {
  tableName: 'institute_tokens',
  timestamps: true,
  indexes: [
    { fields: ['is_revoked'] },
    { fields: ['refresh_token'] },
  ],
});
