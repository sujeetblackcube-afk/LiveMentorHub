import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Course from './Course.js';

const Doubt = sequelize.define('Doubt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  teacherId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: Teacher,
      key: 'teacher_id',
    },
    field: 'teacher_id',
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'description',
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'media_url',
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'reply',
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'replied_at',
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'RESOLVED', 'CLOSED'),
    defaultValue: 'OPEN',
    field: 'status',
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_resolved',
  }
}, {
  tableName: 'doubts',
  timestamps: true,
  indexes: [
    { fields: ['course_code', 'is_resolved', 'createdAt'] },
    { fields: ['student_id'] },
    { fields: ['teacher_id'] }
  ]
});

export default Doubt;
