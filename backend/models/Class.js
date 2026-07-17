import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Class = sequelize.define(
  "Class",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    class_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "classes",
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

export default Class;
