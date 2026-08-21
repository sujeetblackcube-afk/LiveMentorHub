import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Course from './Course.js';
import Teacher from './Teacher.js';

const Assignment = sequelize.define(
  "Assignment",
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
      field: 'description',
    },
    fileUrl: {
      type: DataTypes.STRING,
      field: 'file_url',
    },
    totalMarks: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      field: 'total_marks',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'due_date',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: "assignments",
    timestamps: true,
    indexes: [
      { fields: ['course_code', 'is_active', 'due_date'] },
      { fields: ['teacher_id'] }
    ],
  },
);

export default Assignment;
