import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from "../config/db.js";

const Course = sequelize.define(
  "Course",
  {
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    courseType: {
      type: DataTypes.ENUM("academic", "non-academic"),
      allowNull: false,
    },
    rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: true
  },
    courseDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced"),
      allowNull: false,
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discountedprice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    totalenrollment: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    courseStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    courseDuration: {
      type: DataTypes.INTEGER, // duration in days
      allowNull: true,
    },
    // academic specific fields
    board: DataTypes.STRING,
    medium: DataTypes.STRING,
    classname: DataTypes.STRING,
    subject: DataTypes.STRING,
    subjectCode:  DataTypes.STRING(50),
    
    stream: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // non-academic specific fields
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetAudience: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    totalLessons: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "courses",
    timestamps: true,
    validate: {
      courseValidation() {
        if (this.courseType === "academic") {
          if (!this.classname || !this.subject) {
            throw new Error(
              "Class Level and Subject are required for academic courses",
            );
          }
        }

        if (this.courseType === "non-academic") {
          if (!this.category) {
            throw new Error("Category is required for non-academic courses");
          }
        }
      },
    },
  },
);
export default Course;
