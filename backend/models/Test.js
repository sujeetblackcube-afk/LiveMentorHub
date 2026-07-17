import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Test = sequelize.define(
  "Test",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courseCode:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    questions: {
      type: DataTypes.JSON, // Array of question IDs
      allowNull: false,
    },

    totalMarks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  },
);

export default Test;
