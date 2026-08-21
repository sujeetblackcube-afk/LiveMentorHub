import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Course from './Course.js';
import Teacher from './Teacher.js';

const LiveSession = sequelize.define('LiveSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  },
  sessionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'session_id',
  },
  courseCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Course,
      key: 'course_code',
    },
    field: 'course_code',
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time',
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_time',
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'meeting_link',
  },
  recordingUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'recording_url',
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'SCHEDULED',
    field: 'status',
  }
}, {
  tableName: 'live_sessions',
  timestamps: true,
  indexes: [
    { fields: ['course_code', 'status', 'start_time'] },
    { fields: ['session_id'] },
    { fields: ['teacher_id'] }
  ]
});

export default LiveSession;
