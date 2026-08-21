import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Class from './Class.js';

const Subject = sequelize.define('Subject', {
  subjectCode: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    field: 'subject_code',
  },
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    unique: true,
    field: 'id',
  },
  subjectName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'subject_name',
  },
  forClass: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: Class,
      key: 'class_name',
    },
    field: 'for_class',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
    allowNull: false,
    field: 'status',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'language',
  },
}, {
  tableName: 'subjects',
  timestamps: true,
  indexes: [
    { fields: ['subject_name'] },
    { fields: ['for_class'] },
    { fields: ['status'] }
  ]
});

export default Subject;
