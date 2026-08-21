import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  targetRole: {
    type: DataTypes.ENUM('student', 'teacher', 'parent', 'all'),
    defaultValue: 'all',
    allowNull: false,
    field: 'target_role',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'title',
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url',
  },
  redirectUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'redirect_url',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
    field: 'status',
  }
}, {
  tableName: 'banners',
  timestamps: true,
  indexes: [
    { fields: ['target_role'] },
    { fields: ['status'] }
  ]
});

export default Banner;
