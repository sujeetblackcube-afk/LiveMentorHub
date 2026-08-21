import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id',
    },
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'plan_name',
    },

    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'duration_days',
    },
    coursesAllowed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'courses_allowed',
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'price',
    },

    status: {
      type: DataTypes.ENUM("active", "expired", "cancelled"),
      defaultValue: "active",
      field: 'status',
    },
  }, 
  {
    tableName: "subscriptions",
    timestamps: true,
    indexes: [
      { fields: ['status'] }
    ]
  }
);

export default Subscription;