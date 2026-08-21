import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Teacher from './Teacher.js';

const Payout = sequelize.define(
  "Payout",
  {
    payoutId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'payout_id',
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'order_id',
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
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'amount',
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
      field: 'status',
    },
    payoutDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payout_date',
    },
    utrNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'utr_number',
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'remarks',
    },
  },
  {
    tableName: "teacher_payouts",
    timestamps: true,
    indexes: [
      { fields: ['teacher_id'] },
      { fields: ['status'] },
      { fields: ['order_id'] },
    ],
  }
);

export default Payout;