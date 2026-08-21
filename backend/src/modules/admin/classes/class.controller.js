import Class from '../../../models/Class.js';
import Subject from '../../../models/Subject.js';
import pkg from 'sequelize';
const { Op } = pkg;
import { getPaginatedData } from '../../../utils/pagination.js';
import { createClassRecord } from '../../../services/classService.js';
import {
  getClassStatsService,
  getClassHierarchyService,
} from './class.service.js';

export const createClass = async (req, res) => {
  try {
    const { className, class_description, status } = req.body || {};

    if (req.auth && req.auth.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can create classes.',
      });
    }

    const newClass = await createClassRecord({ className, class_description, status });

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to create class.',
    });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const { status, startDate, endDate, page, limit } = req.query;
    const whereClause = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

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

    const queryOptions = {
      where: whereClause,
      order: [["createdAt", "DESC"]],
    };

    if (page) {
      const paginatedResult = await getPaginatedData(
        Class,
        queryOptions,
        page,
        limit || 10
      );
      return res.status(200).json({
        status: true,
        message: "Classes fetched successfully",
        data: paginatedResult.data,
        pagination: {
          totalItems: paginatedResult.totalItems,
          totalPages: paginatedResult.totalPages,
          currentPage: paginatedResult.currentPage,
          limit: paginatedResult.limit,
        },
      });
    }

    const classes = await Class.findAll(queryOptions);

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

export const updateClassStatus = async (req, res) => {
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

export const editClass = async (req, res) => {
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

export const deleteClass = async (req, res) => {
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

export const getSubjectsByClass = async (req, res) => {
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
        forClass: classInstance.className,
      },
      order: [["createdAt", "DESC"]],
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

export const getClassSummary = async (req, res) => {
  try {
    const data = await getClassStatsService();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch class statistics',
    });
  }
};

export const getClassHierarchyById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getClassHierarchyService(id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to fetch class hierarchy',
    });
  }
};
