import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';
import Class from './Class.js';
import Subject from './Subject.js';

// 1. Core Base Course Model
const Course = sequelize.define(
  "Course",
  {
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      field: 'course_code',
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'id',
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'course_name',
    },
    courseType: {
      type: DataTypes.ENUM("academic", "non-academic"),
      allowNull: false,
      field: 'course_type',
    },
    courseDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'course_description',
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'thumbnail',
    },
    introVideo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'intro_video',
    },
    difficulty: {
      type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced"),
      allowNull: false,
      field: 'difficulty',
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'mrp',
    },
    discountedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'discounted_price',
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
      field: 'status',
    },
    totalEnrollment: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_enrollment',
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deadline',
    },
    courseStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'course_start_date',
    },
    courseDuration: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'course_duration',
    },
    totalLessons: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_lessons',
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: true,
      field: 'rating',
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'total_reviews',
    },
  },
  {
    tableName: "courses",
    timestamps: true,
    getterMethods: {
      discountedprice() { return this.discountedPrice; },
      totalenrollment() { return this.totalEnrollment; },
    },
    setterMethods: {
      discountedprice(val) { this.setDataValue('discountedPrice', val); },
      totalenrollment(val) { this.setDataValue('totalEnrollment', val); },
    },
    indexes: [
      { fields: ['id'] },
      { fields: ['course_type'] },
      { fields: ['status'] },
      { fields: ['difficulty'] },
    ],
  }
);

// 2. Academic Course Detail Sub-Model
const AcademicCourseDetail = sequelize.define(
  "AcademicCourseDetail",
  {
    courseCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Course,
        key: 'course_code',
      },
      field: 'course_code',
    },
    board: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'board',
    },
    medium: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'medium',
    },
    className: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Class,
        key: 'class_name',
      },
      field: 'class_name',
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'subject',
    },
    subjectCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: Subject,
        key: 'subject_code',
      },
      field: 'subject_code',
    },
    stream: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'stream',
    },
  },
  {
    tableName: "academic_course_details",
    timestamps: true,
    getterMethods: {
      classname() { return this.className; },
    },
    setterMethods: {
      classname(val) { this.setDataValue('className', val); },
    },
    indexes: [
      { fields: ['course_code'] },
      { fields: ['board'] },
      { fields: ['class_name'] },
      { fields: ['subject_code'] },
    ],
  }
);

// 3. Non-Academic Course Detail Sub-Model
const NonAcademicCourseDetail = sequelize.define(
  "NonAcademicCourseDetail",
  {
    courseCode: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Course,
        key: 'course_code',
      },
      field: 'course_code',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'category',
    },
    subCategory: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'sub_category',
    },
    targetAudience: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'target_audience',
    },
  },
  {
    tableName: "non_academic_course_details",
    timestamps: true,
    getterMethods: {
      subcategory() { return this.subCategory; },
    },
    setterMethods: {
      subcategory(val) { this.setDataValue('subCategory', val); },
    },
    indexes: [
      { fields: ['course_code'] },
      { fields: ['category'] },
      { fields: ['sub_category'] },
    ],
  }
);

export {
  AcademicCourseDetail,
  NonAcademicCourseDetail
};

export default Course;
