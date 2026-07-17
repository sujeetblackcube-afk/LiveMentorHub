import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const ContactUs = sequelize.define('ContactUs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'REPLIED', 'CLOSED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'parent'),
    allowNull: true
  },
  specificId: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'contact_us',
  timestamps: true
});

export default ContactUs;
