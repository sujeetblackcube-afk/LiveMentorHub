import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  },

  teacherId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'teacher_id',
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text',
  },

  questionType: {
    type: DataTypes.ENUM('MCQ', 'TEXT'),
    allowNull: false,
    field: 'question_type',
  },

  optionA: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'option_a',
  },

  optionB: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'option_b',
  },

  optionC: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'option_c',
  },

  optionD: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'option_d',
  },

  correctAnswer: {
    type: DataTypes.ENUM('optionA', 'optionB', 'optionC', 'optionD'),
    allowNull: true,
    field: 'correct_answer',
  },

  answerText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'answer_text',
  },

  difficultyLevel: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'easy',
    field: 'difficulty_level',
  },

  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'marks',
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  }

}, {
  tableName: 'questions',
  timestamps: true,
  indexes: [
    { fields: ['teacher_id'] },
    { fields: ['question_type'] },
    { fields: ['difficulty_level'] },
    { fields: ['is_active'] }
  ]
});

export default Question;
