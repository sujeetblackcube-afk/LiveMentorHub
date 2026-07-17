import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const NotesMedia = sequelize.define(
  'NotesMedia',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },

    courseCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseType: {
      type: DataTypes.ENUM("academic", "non-academic"),
      allowNull: false,
    },

    teacherName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teacherId: {
    type: DataTypes.STRING,
    allowNull: false
  },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // 🔗 SINGLE URL (image / notes / recorded video)
    contentUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    // 🏷️ WHAT TYPE OF CONTENT THIS URL IS
    contentType: {
      type: DataTypes.ENUM('IMAGE', 'NOTES', 'RECORDED_VIDEO'),
      allowNull: false
    }
  },
  {
    tableName: 'NotesMedia',
    timestamps: true // createdAt, updatedAt
  }
);

export default NotesMedia;