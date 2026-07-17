import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // 🔥 This handles 15 days / 30 days / 90 days etc.
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CoursesAllowed: {
      type: DataTypes.INTEGER,
      allowNull: false,
        defaultValue: 0,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM("active", "expired", "cancelled"),
      defaultValue: "active",
    },

   
  }, 
  {
    tableName: "subscriptions",
    timestamps: true,
  }
);

export default Subscription;