import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Student from './Student.js';
import Course from './Course.js';

const Review = sequelize.define(
  "Review",
  {
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
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Course,
        key: 'course_code',
      },
      field: 'course_code',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
      field: 'rating',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'comment',
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    indexes: [
      { unique: true, fields: ['student_id', 'course_code'] },
      { fields: ['course_code', 'rating'] }
    ]
  }
);

export default Review;
