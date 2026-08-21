import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/db.config.js';

const Class = sequelize.define(
  "Class",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'class_name',
    },
    classDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'class_description',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "ACTIVE",
      field: 'status',
    },
  },
  {
    tableName: "classes",
    timestamps: true,
    getterMethods: {
      classname() { return this.className; },
    },
    setterMethods: {
      classname(val) { this.setDataValue('className', val); },
    },
    indexes: [
      { fields: ['class_name'] },
      { fields: ['status'] }
    ]
  }
);

export default Class;
