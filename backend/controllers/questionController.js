import Question from "../models/Question.js";
import multer from "multer";
import * as XLSX from "xlsx";

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel and CSV files are allowed."), false);
    }
  }
});

// Export upload middleware
export const uploadExcel = upload.single("file");

// Controller to create a single question
export const createQuestion = async (req, res) => {
  try {
    const {
      teacherId,
      questionText,
      questionType,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      answerText,
      difficultyLevel,
      marks,
    } = req.body;

    if (!teacherId || !questionText || !questionType) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: teacherId, questionText, questionType"
      });
    }

    if (questionType === 'MCQ') {
      if (!optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        return res.status(400).json({
          success: false,
          message: "All MCQ fields required: optionA, optionB, optionC, optionD, correctAnswer"
        });
      }
    }

    if (questionType === 'TEXT') {
      if (!answerText) {
        return res.status(400).json({
          success: false,
          message: "Answer text required for TEXT type question"
        });
      }
    }

    const question = await Question.create({
      teacherId,
      questionText,
      questionType,
      optionA: questionType === 'MCQ' ? optionA : null,
      optionB: questionType === 'MCQ' ? optionB : null,
      optionC: questionType === 'MCQ' ? optionC : null,
      optionD: questionType === 'MCQ' ? optionD : null,
      correctAnswer: questionType === 'MCQ' ? correctAnswer : null,
      answerText: questionType === 'TEXT' ? answerText : null,
      difficultyLevel: difficultyLevel || 'easy',
      marks: marks || 1,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Controller to get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const { teacherId, questionType, difficultyLevel, isActive } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (teacherId) {
      whereClause.teacherId = teacherId;
    }
    
    if (questionType) {
      whereClause.questionType = questionType;
    }
    
    if (difficultyLevel) {
      whereClause.difficultyLevel = difficultyLevel;
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const questions = await Question.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions: questions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Controller to get a question by ID
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    res.status(200).json({
      success: true,
      question: question
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Controller to update a question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      questionType,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      answerText,
      difficultyLevel,
      marks,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Validate MCQ fields if questionType is MCQ
    if (questionType === 'MCQ' || question.questionType === 'MCQ') {
      if (questionType === 'MCQ' && (!optionA || !optionB || !optionC || !optionD || !correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: "All MCQ fields required: optionA, optionB, optionC, optionD, correctAnswer"
        });
      }
    }

    // Validate TEXT fields if questionType is TEXT
    if (questionType === 'TEXT' || question.questionType === 'TEXT') {
      if (questionType === 'TEXT' && !answerText) {
        return res.status(400).json({
          success: false,
          message: "Answer text required for TEXT type question"
        });
      }
    }

    // Build update object
    const updateData = {};
    
    if (questionText !== undefined) updateData.questionText = questionText;
    if (questionType !== undefined) updateData.questionType = questionType;
    if (optionA !== undefined) updateData.optionA = questionType === 'MCQ' ? optionA : null;
    if (optionB !== undefined) updateData.optionB = questionType === 'MCQ' ? optionB : null;
    if (optionC !== undefined) updateData.optionC = questionType === 'MCQ' ? optionC : null;
    if (optionD !== undefined) updateData.optionD = questionType === 'MCQ' ? optionD : null;
    if (correctAnswer !== undefined) updateData.correctAnswer = questionType === 'MCQ' ? correctAnswer : null;
    if (answerText !== undefined) updateData.answerText = questionType === 'TEXT' ? answerText : null;
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
    if (marks !== undefined) updateData.marks = parseInt(marks);
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedRows] = await Question.update(updateData, {
      where: { id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found or no changes made"
      });
    }

    const updatedQuestion = await Question.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: updatedQuestion
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Controller to delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    const deletedRows = await Question.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Controller to create questions from Excel file
export const createQuestionsFromExcel = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacherId is required in request body"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Read the Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON array
    const questionsData = XLSX.utils.sheet_to_json(worksheet);

    if (questionsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty"
      });
    }

    // Validate and create questions
    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < questionsData.length; i++) {
      const row = questionsData[i];
      const rowNumber = i + 2; // Excel row number (1-indexed + header)

      try {
        // Required fields validation
        if (!row.questionText) {
          errors.push(`Row ${rowNumber}: questionText is required`);
          continue;
        }

        const questionType = row.questionType ? row.questionType.toUpperCase() : 'MCQ';
        
        if (questionType === 'MCQ') {
          if (!row.optionA || !row.optionB || !row.optionC || !row.optionD || !row.correctAnswer) {
            errors.push(`Row ${rowNumber}: MCQ requires optionA, optionB, optionC, optionD, and correctAnswer`);
            continue;
          }
        }

        if (questionType === 'TEXT') {
          if (!row.answerText) {
            errors.push(`Row ${rowNumber}: TEXT type requires answerText`);
            continue;
          }
        }

        // Validate correctAnswer for MCQ
        if (questionType === 'MCQ' && !['A', 'B', 'C', 'D'].includes(row.correctAnswer.toUpperCase())) {
          errors.push(`Row ${rowNumber}: correctAnswer must be A, B, C, or D`);
          continue;
        }

        // Validate difficultyLevel
        const validDifficultyLevels = ['easy', 'medium', 'hard'];
        const difficultyLevel = row.difficultyLevel ? row.difficultyLevel.toLowerCase() : 'easy';
        if (!validDifficultyLevels.includes(difficultyLevel)) {
          errors.push(`Row ${rowNumber}: difficultyLevel must be easy, medium, or hard`);
          continue;
        }

        // Create the question
        const question = await Question.create({
          teacherId: teacherId,
          questionText: row.questionText,
          questionType: questionType,
          optionA: questionType === 'MCQ' ? row.optionA : null,
          optionB: questionType === 'MCQ' ? row.optionB : null,
          optionC: questionType === 'MCQ' ? row.optionC : null,
          optionD: questionType === 'MCQ' ? row.optionD : null,
          correctAnswer: questionType === 'MCQ' ? row.correctAnswer.toUpperCase() : null,
          answerText: questionType === 'TEXT' ? row.answerText : null,
          difficultyLevel: difficultyLevel,
          marks: row.marks ? parseInt(row.marks) : 1,
          isActive: true,
        });

        createdQuestions.push(question);

      } catch (rowError) {
        errors.push(`Row ${rowNumber}: ${rowError.message}`);
      }
    }

    // Return response
    if (createdQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No questions could be created",
        errors: errors
      });
    }

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      totalRows: questionsData.length,
      createdCount: createdQuestions.length,
      failedCount: errors.length,
      questions: createdQuestions,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
