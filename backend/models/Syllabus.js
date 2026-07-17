import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";
import Course from './Course.js';

const Syllabus = sequelize.define(
  "Syllabus",
  {
    courseCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Course,
        key: 'courseCode'
      }
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    syllabusUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    syllabusPoints: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  },
  {
    tableName: "syllabus",
    timestamps: true
  }
);

export default Syllabus;

