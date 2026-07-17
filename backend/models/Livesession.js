import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const LiveSession = sequelize.define(
  "LiveSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    sessionId: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    courseName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    courseCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // Teacher Info
    teacherId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    teacherName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // Session Content
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    thumbnailUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Time
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Status
    status: {
      type: DataTypes.ENUM(
        "upcoming",
        "ongoing",
        "completed",
        "cancelled"
      ),
      defaultValue: "upcoming",
    },

    // Recording
    recordingUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Stats
    totalStudentsJoined: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // Agora Integration
    platform: {
      type: DataTypes.ENUM('Agora', 'Other'),
      defaultValue: 'Agora',
      allowNull: false,
    },

    appId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    channelName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    uid: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    maxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },

    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "livesessions",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default LiveSession;
