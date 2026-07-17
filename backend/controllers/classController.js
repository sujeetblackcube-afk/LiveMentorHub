import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import pkg from 'sequelize';
const { Op } = pkg;

const createClass = async (req, res) => {
  try {
    const { className, class_description } = req.body;

    if (!className || !class_description) {
      return res.status(400).json({
        status: false,
        message: "className and class_description are required",
      });
    }

    const newClass = await Class.create({
      className,
      class_description,
    });

    return res.status(201).json({
      status: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const whereClause = {};

    // filter by status
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // filter by date range (createdAt)
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [
          new Date(`${startDate} 00:00:00`),
          new Date(`${endDate} 23:59:59`),
        ],
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(`${startDate} 00:00:00`),
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(`${endDate} 23:59:59`),
      };
    }

    const classes = await Class.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Classes fetched successfully",
      data: classes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateClassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["ACTIVE", "INACTIVE"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value",
      });
    }

    const classInstance = await Class.findByPk(id);

    if (!classInstance) {
      return res.status(404).json({
        status: false,
        message: "Class not found",
      });
    }

    classInstance.status = status;
    await classInstance.save();

    return res.status(200).json({
      status: true,
      message: "Class status updated successfully",
      data: classInstance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const editClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, class_description } = req.body;

    const classInstance = await Class.findByPk(id);

    if (!classInstance) {
      return res.status(404).json({
        status: false,
        message: "Class not found",
      });
    }

    if (className !== undefined) {
      classInstance.className = className;
    }
    if (class_description !== undefined) {
      classInstance.class_description = class_description;
    }

    await classInstance.save();

    return res.status(200).json({
      status: true,
      message: "Class updated successfully",
      data: classInstance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classInstance = await Class.findByPk(id);

    if (!classInstance) {
      return res.status(404).json({
        status: false,
        message: "Class not found",
      });
    }

    await classInstance.destroy();

    return res.status(200).json({
      status: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getSubjectsByClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classInstance = await Class.findByPk(id);

    if (!classInstance) {
      return res.status(404).json({
        status: false,
        message: "Class not found",
      });
    }

    const subjects = await Subject.findAll({
      where: {
        ForClass: classInstance.className,
      },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Subjects fetched successfully",
      data: subjects,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export { createClass, getAllClasses, updateClassStatus, editClass, deleteClass, getSubjectsByClass };
