import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const Assignment = sequelize.define(
  "Assignment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    teacherId: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    teacherName:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    totalMarks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "pdf, docx, txt, jpg, png, mp4 etc",
    },

    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

export default Assignment;
