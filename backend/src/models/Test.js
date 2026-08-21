import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const Test = sequelize.define(
  "Test",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    courseCode:{
      type: DataTypes.STRING,
      allowNull: false,
      field: 'course_code',
    },

    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'teacher_id',
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'title',
    },

    description: {
      type: DataTypes.TEXT,
      field: 'description',
    },

    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'questions',
    },

    totalMarks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_marks',
    },

    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_minutes',
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
    maxAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'max_attempts',
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_published',
    },
  },
  {
    tableName: 'tests',
    timestamps: true,
    indexes: [
      { fields: ['course_code', 'is_published', 'start_time'] },
      { fields: ['teacher_id'] }
    ]
  },
);

export default Test;
