import Subject from "../models/Subject.js";
import pkg from 'sequelize';
const { Op } = pkg;

// Helper function to generate subject id globally
const generateSubjectId = async () => {
  // Find the maximum id across all subject tables
  const lastSubject = await Subject.findOne({
    order: [["id", "DESC"]],
    attributes: ["id"],
  });

  let nextId = 1;
  if (lastSubject && lastSubject.id) {
    nextId = lastSubject.id + 1;
  }

  return nextId;
};

export const createSubject = async (req, res) => {
  try {
    const {
      subjectName,
      ForClass = null,
      description = null,
      language,
    } = req.body;

    // 🔴 Required validation
    if (!subjectName || !language) {
      return res.status(400).json({
        success: false,
        message: "Subject name and language are required",
      });
    }

    // 🔹 Generate subject code prefix (first 3 letters)
    const prefix = subjectName
      .replace(/\s+/g, "")
      .substring(0, 3)
      .toUpperCase();

    // 🔹 Find last subject with same prefix
    const lastSubject = await Subject.findOne({
      where: {
        subjectCode: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["created_at", "DESC"]],
    });

    let nextNumber = 1;

    if (lastSubject) {
      const lastCode = lastSubject.subjectCode;
      const lastNumber = parseInt(lastCode.replace(prefix, ""), 10);
      nextNumber = lastNumber + 1;
    }

    // 🔹 Format code (01, 02, 03...)
    const subjectCode = `${prefix}${String(nextNumber).padStart(2, "0")}`;

    // 🔹 Create subject (id will be auto-generated)
    const id = await generateSubjectId();
    const subject = await Subject.create({
      id,
      subjectName,
      subjectCode,
      ForClass,
      description,
      language,
      status: "ACTIVE", // default
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getAllSubjects = async (req, res) => {
  try {
    const { status, ForClass, language } = req.query;

    const where = {};
    if (status) where.status = status;
    if (ForClass) where.ForClass = ForClass;
    if (language) where.language = { [Op.like]: `%${language}%` };

    const subjects = await Subject.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getSubjectById = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    const subject = await Subject.findByPk(subjectCode);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Get Subject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateSubject = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    const subject = await Subject.findByPk(subjectCode);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Allowed fields to update
    const allowedFields = [
      "ForClass",
      "status",
      "description",
      "language",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        subject[field] = req.body[field];
      }
    });

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Update Subject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deleteSubject = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    const subject = await Subject.findByPk(subjectCode);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    await subject.destroy();

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateSubjectStatus = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const { status } = req.body;

    const allowedStatus = ["ACTIVE", "INACTIVE"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const subject = await Subject.findByPk(subjectCode);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    subject.status = status;
    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Subject status updated successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Update Subject Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

