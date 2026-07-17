import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Student = sequelize.define(
  "Student",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },

    studentId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    parentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    parentEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    parentMobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING(20),
      defaultValue: "student",
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lattitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },

    playerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    Devicetype: {
      type: DataTypes.ENUM("android", "ios", "web"),
      allowNull: true,
    },

    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    otpVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("APPROVED", "SUSPENDED", "TERMINATED"),
      defaultValue: "APPROVED",
      allowNull: false,
    },

    parentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // =========================
    // NEW STUDENT REGISTRATION FIELDS
    // =========================

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    schoolName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    board: {
      type: DataTypes.ENUM(
        "CBSE",
        "ICSE",
        "State Board",
        "IB",
        "Other"
      ),
      allowNull: true,
    },

    classGrade: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    guardianRelationship: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subjectsRequired: {
      type: DataTypes.JSON,
      allowNull: true,
      // Example:
      // ["Mathematics", "Science", "English"]
    },


    tuitionType: {
      type: DataTypes.ENUM(
        "Individual",
        "Batch"
      ),
      allowNull: true,
    },


    preferredTiming: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    preferredDays: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    lastExamPercentage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    areasOfImprovement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    specialLearningNeeds: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deviceAvailable: {
      type: DataTypes.JSON,
      allowNull: true,
      // Example:
      // ["Mobile", "Laptop"]
    },

    internetConnectivity: {
      type: DataTypes.ENUM(
        "Stable",
        "Moderate",
        "Poor"
      ),
      allowNull: true,
    },

    activeWebToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    activeAppToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "students",
    timestamps: true,
  }
);

export default Student;