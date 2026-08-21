import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Parent from './Parent.js';
import SuperAdmin from './SuperAdmin.js';

// 1. Student OTP Model
export const StudentOtp = sequelize.define('StudentOtp', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: Student,
      key: 'student_id',
    },
    field: 'student_id',
  },
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'identifier',
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'otp_code',
  },
  otpType: {
    type: DataTypes.ENUM('SIGNUP', 'LOGIN', 'FORGOT_PASSWORD'),
    defaultValue: 'SIGNUP',
    field: 'otp_type',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
}, {
  tableName: 'student_otps',
  timestamps: true,
  indexes: [
    { fields: ['identifier', 'otp_code', 'is_used'] },
    { fields: ['student_id'] },
  ],
});

// 2. Teacher OTP Model
export const TeacherOtp = sequelize.define('TeacherOtp', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: Teacher,
      key: 'teacher_id',
    },
    field: 'teacher_id',
  },
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'identifier',
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'otp_code',
  },
  otpType: {
    type: DataTypes.ENUM('SIGNUP', 'LOGIN', 'FORGOT_PASSWORD'),
    defaultValue: 'SIGNUP',
    field: 'otp_type',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
}, {
  tableName: 'teacher_otps',
  timestamps: true,
  indexes: [
    { fields: ['identifier', 'otp_code', 'is_used'] },
    { fields: ['teacher_id'] },
  ],
});

// 3. Parent OTP Model
export const ParentOtp = sequelize.define('ParentOtp', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: Parent,
      key: 'parent_id',
    },
    field: 'parent_id',
  },
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'identifier',
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'otp_code',
  },
  otpType: {
    type: DataTypes.ENUM('SIGNUP', 'LOGIN', 'FORGOT_PASSWORD'),
    defaultValue: 'SIGNUP',
    field: 'otp_type',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
}, {
  tableName: 'parent_otps',
  timestamps: true,
  indexes: [
    { fields: ['identifier', 'otp_code', 'is_used'] },
    { fields: ['parent_id'] },
  ],
});

// 4. Admin OTP Model
export const AdminOtp = sequelize.define('AdminOtp', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: SuperAdmin,
      key: 'user_id',
    },
    field: 'user_id',
  },
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'identifier',
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'otp_code',
  },
  otpType: {
    type: DataTypes.ENUM('LOGIN', 'FORGOT_PASSWORD'),
    defaultValue: 'LOGIN',
    field: 'otp_type',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
}, {
  tableName: 'admin_otps',
  timestamps: true,
  indexes: [
    { fields: ['identifier', 'otp_code', 'is_used'] },
    { fields: ['user_id'] },
  ],
});

// 5. Institute OTP Model (Future Ready)
export const InstituteOtp = sequelize.define('InstituteOtp', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'identifier',
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'otp_code',
  },
  otpType: {
    type: DataTypes.ENUM('SIGNUP', 'LOGIN', 'FORGOT_PASSWORD'),
    defaultValue: 'SIGNUP',
    field: 'otp_type',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
}, {
  tableName: 'institute_otps',
  timestamps: true,
  indexes: [
    { fields: ['identifier', 'otp_code', 'is_used'] },
  ],
});
