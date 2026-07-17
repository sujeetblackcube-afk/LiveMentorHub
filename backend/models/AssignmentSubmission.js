import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const AssignmentSubmission = sequelize.define(
  "AssignmentSubmission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studentName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    teacherId: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    teacherName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    submissionText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    submissionFileType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "pdf, docx, txt, jpg, png, etc",
    },

    submissionFileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    obtainedMarks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("submitted", "checked", "notsubmitted"),
      defaultValue: "submitted",
    },
    percentage: {
  type: DataTypes.FLOAT,
  defaultValue: 0
},

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default AssignmentSubmission;
