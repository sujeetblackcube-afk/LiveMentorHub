import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Teacher = sequelize.define(
  "Teacher",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    teacherId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    coursename: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    courseCode: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "APPROVED",
        "SUSPENDED",
        "TERMINATED"
      ),
      defaultValue: "PENDING",
      allowNull: false,
    },

    // =========================
    // BASIC DETAILS
    // =========================

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
      allowNull: false,
    },

    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    country: {
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

    // =========================
    // EDUCATION DETAILS
    // =========================

    qualification: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    specializations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    // =========================
    // PROFESSIONAL DETAILS
    // =========================

    totalTeachingExperience: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "In Years",
    },

    relevantExperience: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subjectsCanTeach: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    classesCanTeach: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    preferredCurriculum: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // Example:
      // ["CBSE","ICSE","IB"]
    },

    languagesCanTeach: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    // =========================
    // ONLINE TEACHING DETAILS
    // =========================

    teachingMode: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // ["One-on-One","Batch Classes"]
    },

    batchSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    teachingPlatforms: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // ["Zoom","Google Meet"]
    },

    availability: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    internetConnectivity: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    hasLaptopDesktop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasWebcam: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasDigitalWritingPad: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasHeadset: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // =========================
    // PRICING DETAILS
    // =========================

    individualClassFeesPerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    batchClassFeesPerStudentMonth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    preferredPaymentModes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // ["UPI","Bank Transfer"]
    },

    // =========================
    // LOCATION PREFERENCE
    // =========================

    preferredStudentLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // =========================
    // DOCUMENTS
    // =========================

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    idProofDocument: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    qualificationCertificates: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    experienceCertificates: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    // =========================
    // AUTH & DEVICE
    // =========================

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

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    playerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    Devicetype: {
      type: DataTypes.ENUM("android", "ios", "web"),
      allowNull: true,
    },

    // =========================
    // OTHER
    // =========================

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: true,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    role: {
      type: DataTypes.STRING(20),
      defaultValue: "teacher",
      allowNull: false,
    },
  },
  {
    tableName: "teachers",
    timestamps: true,
  }
);

export default Teacher;