import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  teacherId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // 👇 Question Type
  questionType: {
    type: DataTypes.ENUM('MCQ', 'TEXT'),
    allowNull: false
  },

  // 👇 MCQ Fields (nullable for TEXT type)
  optionA: {
    type: DataTypes.STRING,
    allowNull: true
  },

  optionB: {
    type: DataTypes.STRING,
    allowNull: true
  },

  optionC: {
    type: DataTypes.STRING,
    allowNull: true
  },

  optionD: {
    type: DataTypes.STRING,
    allowNull: true
  },

  correctAnswer: {
    type: DataTypes.ENUM('optionA', 'optionB', 'optionC', 'optionD'),
    allowNull: true
  },

  // 👇 For TEXT type question
  answerText: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  difficultyLevel: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'easy'
  },

  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

}, {
  timestamps: true
});

export default Question;
