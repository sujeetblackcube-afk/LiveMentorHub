import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const TestSubmission = sequelize.define('TestSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  },

  testId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'test_id',
  },

  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'student_id',
  },
  attemptNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'attempt_number',
  },

  answers: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'answers',
  },

  obtainedMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'obtained_marks',
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'teacher_id',
  },

  percentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'percentage',
  },
  status: {
    type: DataTypes.ENUM('NOTSUBMITTED', 'SUBMITTED', 'GRADED'),
    defaultValue: 'NOTSUBMITTED',
    field: 'status',
  },
  courseCode:{
    type: DataTypes.STRING,
    allowNull: true,
    field: 'course_code',
  },

  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'submitted_at',
  }

}, {
  tableName: 'test_submissions',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['test_id', 'student_id', 'attempt_number'] },
    { fields: ['student_id'] },
    { fields: ['teacher_id'] },
    { fields: ['course_code'] },
    { fields: ['status'] }
  ]
});

export default TestSubmission;
