import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Student from './Student.js';
import Course from './Course.js';

const Enrollment = sequelize.define(
  "Enrollment",
  {
    enrollmentCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      field: 'enrollment_code',
    },
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
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
    teacherId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'teacher_id',
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED", "CANCELLED", "COMPLETED"),
      defaultValue: "ACTIVE",
      field: 'status',
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'enrollment_date',
    },
    enrollmentExpireDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'enrollment_expire_date',
    },
    pdfUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pdf_url',
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'progress',
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_accessed_at',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'remarks',
    },
  },
  {
    tableName: "enrollments",
    timestamps: true,
    indexes: [
      { unique: true, fields: ['student_id', 'course_code'] },
      { fields: ['student_id', 'status'] },
      { fields: ['course_code'] },
      { fields: ['teacher_id'] },
      { fields: ['status'] },
    ],
  }
);

export default Enrollment;
