import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Assignment from './Assignment.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Course from './Course.js';

const AssignmentSubmission = sequelize.define(
  "AssignmentSubmission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Assignment,
        key: 'id',
      },
      field: 'assignment_id',
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
    submissionFileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'submission_file_url',
    },
    submissionText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'submission_text',
    },
    obtainedMarks: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'obtained_marks',
    },
    teacherId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Teacher,
        key: 'teacher_id',
      },
      field: 'teacher_id',
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'feedback',
    },
    status: {
      type: DataTypes.ENUM("SUBMITTED", "EVALUATED", "REJECTED"),
      defaultValue: "SUBMITTED",
      field: 'status',
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Course,
        key: 'course_code',
      },
      field: 'course_code',
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at',
    },
  },
  {
    tableName: "assignment_submissions",
    timestamps: true,
    indexes: [
      { unique: true, fields: ['assignment_id', 'student_id'] },
      { fields: ['student_id'] },
      { fields: ['teacher_id'] },
      { fields: ['course_code'] },
      { fields: ['status'] }
    ],
  }
);

export default AssignmentSubmission;
