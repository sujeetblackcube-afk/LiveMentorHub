import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'key',
  },
  targetRole: {
    type: DataTypes.ENUM('student', 'teacher', 'parent', 'all'),
    defaultValue: 'all',
    allowNull: false,
    field: 'target_role',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
  },
  liveUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'live_url',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
    field: 'status',
  }
}, {
  tableName: 'contents',
  timestamps: true,
  indexes: [
    { fields: ['key'] },
    { fields: ['target_role'] },
    { fields: ['status'] }
  ]
});

export default Content;
