import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
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
        key: 'course_code'
      },
      field: 'course_code',
    },
    syllabusUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'syllabus_url',
    },
    introVideoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'intro_video_url',
    },
    syllabusPoints: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'syllabus_points',
    }
  },
  {
    tableName: "syllabus",
    timestamps: true,
  }
);

export default Syllabus;
