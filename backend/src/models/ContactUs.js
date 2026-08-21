import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import { StudentSupportTicket } from './Student.js';
import { TeacherSupportTicket } from './Teacher.js';
import { ParentSupportTicket } from './Parent.js';

// Pre-login Guest Support Inquiries Model
const GuestSupportTicket = sequelize.define('GuestSupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'email',
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mobile',
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'subject',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RESOLVED'),
    defaultValue: 'PENDING',
    field: 'status',
  }
}, {
  tableName: 'guest_support_tickets',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['status'] }
  ]
});

export {
  GuestSupportTicket,
  StudentSupportTicket,
  TeacherSupportTicket,
  ParentSupportTicket
};

export default GuestSupportTicket;
