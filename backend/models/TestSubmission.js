import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const TestSubmission = sequelize.define('TestSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  testId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  studentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  attemptNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  answers: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  obtainedMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  teacherId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

  percentage: {
  type: DataTypes.FLOAT,
  defaultValue: 0
},
  status: {
    type: DataTypes.ENUM('NOTSUBMITTED', 'SUBMITTED', 'GRADED'),
    defaultValue: 'NOTSUBMITTED'
  },
  courseCode:{
        type: DataTypes.STRING,
        allowNull: true,
    },

  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  timestamps: true
});

export default TestSubmission;
