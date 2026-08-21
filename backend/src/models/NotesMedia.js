import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Course from './Course.js';
import Teacher from './Teacher.js';

const NotesMedia = sequelize.define('NotesMedia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
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
    allowNull: false,
    references: {
      model: Teacher,
      key: 'teacher_id',
    },
    field: 'teacher_id',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_url',
  },
  contentType: {
    type: DataTypes.ENUM('PDF', 'VIDEO', 'IMAGE', 'AUDIO', 'OTHER'),
    defaultValue: 'PDF',
    field: 'content_type',
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public',
  }
}, {
  tableName: 'notes_media',
  timestamps: true,
  indexes: [
    { fields: ['course_code', 'teacher_id'] },
    { fields: ['content_type'] },
    { fields: ['is_public'] }
  ]
});

export default NotesMedia;