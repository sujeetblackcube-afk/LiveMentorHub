import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Doubt = sequelize.define(
  "Doubt",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    studentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    teacherId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    teacherName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doubtTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doubtText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    answerText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "doubts",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default Doubt;
