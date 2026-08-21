import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import { StudentNotification } from './Student.js';
import { TeacherNotification } from './Teacher.js';
import { ParentNotification } from './Parent.js';

// Broadcast Announcements Model
const BroadcastNotification = sequelize.define('BroadcastNotification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  targetRole: {
    type: DataTypes.ENUM('teacher', 'student', 'parent', 'all'),
    defaultValue: 'all',
    allowNull: false,
    field: 'target_role',
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
    defaultValue: 'BROADCAST',
    field: 'type',
  }
}, {
  tableName: 'broadcast_notifications',
  timestamps: true,
  indexes: [
    { fields: ['target_role'] },
    { fields: ['type'] }
  ]
});

export {
  BroadcastNotification,
  StudentNotification,
  TeacherNotification,
  ParentNotification
};

export default BroadcastNotification;