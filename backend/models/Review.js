import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
  }
);

export default Review;
