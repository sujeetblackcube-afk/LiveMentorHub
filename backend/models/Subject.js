import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Subject = sequelize.define(
  "Subject",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    subjectName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    subjectCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },

    ForClass: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    language: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    tableName: "subjects",
    timestamps: true,
    underscored: true,
  },
);

export default Subject;
