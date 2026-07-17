import Test from "../models/Test.js";
import TestSubmission from "../models/TestSubmission.js";
import Enrollment from "../models/Enrollment.js";
import Teacher from "../models/Teacher.js";
import Question from "../models/Question.js";
import Course from "../models/Course.js";
import Notification from "../models/Notifications.js";
import { triggerPushForNotifications } from "../config/onesignalService.js";
import pkg from 'sequelize';
const { Op } = pkg;
// Controller to create a new test
export const createTest = async (req, res) => {
  try {
    const {
      courseCode,
      teacherId,
      title,
      description,
      questions,
      totalMarks,
      durationMinutes,
      startTime,
      endTime,
      maxAttempts,
      isPublished,
    } = req.body;

    // Validate required fields
    if (
      !courseCode ||
      !teacherId ||
      !title ||
      !durationMinutes ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields missing: courseCode, teacherId, title, durationMinutes, startTime, endTime",
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required and must not be empty",
      });
    }

    // 🔎 Get teacher (for name)
    const teacher = await Teacher.findOne({ where: { teacherId } });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }
    const teacherName = teacher.name;

    // 🔎 Get course (for courseName in notification)
    const course = await Course.findOne({ where: { courseCode } });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found with this courseCode",
      });
    }


    // 📝 Create Test
    const test = await Test.create({
      courseCode,
      teacherId,
      title,
      description: description || null,
      questions,
      totalMarks: totalMarks || 0,
      durationMinutes,
      startTime,
      endTime,
      maxAttempts: maxAttempts || 1,
      isPublished: true,
    });

    // console.log("=== DEBUG TEST CREATION ===");
    // console.log("courseCode:", courseCode);
    // console.log("teacherId:", teacherId);
    // console.log("Test created with ID:", test.id);

    // 👨‍🎓 Find all approved enrollments
    const enrollments = await Enrollment.findAll({
      where: {
        courseCode: courseCode,
        teacherId: teacherId,
        status: "APPROVED",
      },
    });

    // console.log("Found enrollments count:", enrollments.length);

    let testSubmissions = [];

    if (enrollments.length > 0) {
      // ================= TEST SUBMISSIONS =================
      const testSubmissionsData = enrollments.map((enrollment) => ({
        courseCode: test.courseCode,
        teacherId: teacherId,
        testId: test.id,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        attemptNumber: 0,
        answers: null,
        obtainedMarks: 0,
        percentage: 0,
        status: "NOTSUBMITTED",
        submittedAt: null,
      }));

      testSubmissions = await TestSubmission.bulkCreate(testSubmissionsData);

      // ================= NOTIFICATIONS (STUDENTS) =================
      const notifications = [];

      enrollments.forEach((enrollment) => {
        notifications.push({
          specificId: enrollment.studentId, // 🔥 IMPORTANT (not specificId)
          role: "student",
          title: "📝 New Test Available",
          message: `${title} test added for ${
            course?.courseName || courseCode
          }. Starts: ${startTime}`,
          type: "test",
          referenceId: test.id,
        });
      });

      // 💾 Save notifications in DB
      const createdNotifications = await Notification.bulkCreate(
        notifications,
        { returning: true },
      );

      // 🔔 CENTRALIZED PUSH (OneSignal single hit)
      await triggerPushForNotifications(createdNotifications);
    }

    res.status(201).json({
      success: true,
      message: "Test created successfully and notifications sent",
      data: test,
      testSubmissions,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to get all tests
export const getAllTests = async (req, res) => {
  try {
    const { teacherId, courseCode, isPublished } = req.query;

    // Build where clause
    const whereClause = {};

    if (teacherId) {
      whereClause.teacherId = teacherId;
    }

    if (courseCode) {
      whereClause.courseCode = courseCode;
    }

    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished === "true";
    }

    const tests = await Test.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests: tests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to get test by ID
export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Test ID is required",
      });
    }

    const test = await Test.findByPk(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.status(200).json({
      success: true,
      test: test,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to get all tests by courseCode
export const getAllTestsByCourseCode = async (req, res) => {
  try {
    const { courseCode } = req.params;

    if (!courseCode) {
      return res.status(400).json({
        success: false,
        message: "Course code is required",
      });
    }

    const tests = await Test.findAll({
      where: { courseCode },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests: tests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to update a test
export const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courseCode,
      title,
      description,
      questions,
      totalMarks,
      durationMinutes,
      startTime,
      endTime,
      maxAttempts,
      isPublished,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Test ID is required",
      });
    }

    const test = await Test.findByPk(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Build update object
    const updateData = {};

    if (courseCode !== undefined) updateData.courseCode = courseCode;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Questions must be a non-empty array",
        });
      }
      updateData.questions = questions;
    }
    if (totalMarks !== undefined) updateData.totalMarks = parseInt(totalMarks);
    if (durationMinutes !== undefined)
      updateData.durationMinutes = parseInt(durationMinutes);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (maxAttempts !== undefined)
      updateData.maxAttempts = parseInt(maxAttempts);
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const [updatedRows] = await Test.update(updateData, {
      where: { id },
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Test not found or no changes made",
      });
    }

    const updatedTest = await Test.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test: updatedTest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to delete a test
export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Test ID is required",
      });
    }

    // First, delete all associated test submissions to prevent foreign key constraint violations
    await TestSubmission.destroy({
      where: { testId: id }
    });

    const deletedRows = await Test.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to fetch all tests for a student based on enrolled courses
export const fetchAllTestsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Step 1: Find all TestSubmissions for this student
    const testSubmissions = await TestSubmission.findAll({
      where: {
        studentId: studentId,
      },
      order: [["createdAt", "DESC"]],
    });

    if (testSubmissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No test submissions found for this student",
        count: 0,
        tests: [],
      });
    }

    // Step 2: Get unique testIds from submissions
    const testIds = [
      ...new Set(testSubmissions.map((submission) => submission.testId)),
    ];

    // Step 3: Find all tests for those testIds
    const tests = await Test.findAll({
      where: {
        id: testIds,
      },
      order: [["createdAt", "DESC"]],
    });

    // Step 4: Get unique teacherIds from tests
    const teacherIds = [...new Set(tests.map((test) => test.teacherId))];

    // Step 5: Find all teachers for those teacherIds
    const teachers = await Teacher.findAll({
      where: {
        teacherId: teacherIds,
      },
      attributes: ["teacherId", "name"],
    });

    // Create a map for quick teacher lookup
    const teacherMap = {};
    teachers.forEach((teacher) => {
      teacherMap[teacher.teacherId] = teacher;
    });

    // Step 7: Extract all question IDs from tests and fetch questions from Question table
    const allQuestionIds = [];
    tests.forEach((test) => {
      if (test.questions && Array.isArray(test.questions)) {
        test.questions.forEach((qId) => {
          if (!allQuestionIds.includes(qId)) {
            allQuestionIds.push(qId);
          }
        });
      }
    });

    // Fetch all questions from Question table
    let questions = [];
    if (allQuestionIds.length > 0) {
      questions = await Question.findAll({
        where: {
          id: allQuestionIds,
        },
      });
    }

    // Create a map for quick question lookup
    const questionMap = {};
    questions.forEach((question) => {
      // Determine the answer based on question type
      let answer = null;
      if (question.questionType === "TEXT") {
        answer = question.answerText;
      } else if (question.questionType === "MCQ") {
        answer = question.correctAnswer;
      }

      questionMap[question.id] = {
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        answer: answer,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        marks: question.marks,
      };
    });

    // Step 8: Combine test submissions with test and teacher data
    const combinedData = testSubmissions.map((submission) => {
      const test = tests.find((t) => t.id === submission.testId);
      const teacher = test ? teacherMap[test.teacherId] : null;

      // Process questions to include answers
      let processedQuestions = [];
      if (test && test.questions && Array.isArray(test.questions)) {
        processedQuestions = test.questions
          .map((qId) => {
            return questionMap[qId] || null;
          })
          .filter((q) => q !== null);
      }

      return {
        // TestSubmission data
        submissionId: submission.id,
        testId: submission.testId,
        studentId: submission.studentId,
        attemptNumber: submission.attemptNumber,
        answers: submission.answers,
        obtainedMarks: submission.obtainedMarks,
        percentage: submission.percentage,
        status: submission.status,
        submittedAt: submission.submittedAt,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        // Test data
        test: test
          ? {
              title: test.title,
              description: test.description,
              totalMarks: test.totalMarks,
              durationMinutes: test.durationMinutes,
              startTime: test.startTime,
              endTime: test.endTime,
              maxAttempts: test.maxAttempts,
              isPublished: test.isPublished,
              courseCode: test.courseCode,
              questionDetails: processedQuestions,
            }
          : null,
        // Teacher data
        teacher: teacher
          ? {
              teacherId: teacher.teacherId,
              teacherName: teacher.name,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      count: combinedData.length,
      tests: combinedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitTestByStudent = async (req, res) => {
  try {
    const { submissionId, answers } = req.body;

    // 1️⃣ Validate input
    if (!submissionId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "submissionId and answers array are required",
      });
    }

    // 2️⃣ Find submission
    const submission = await TestSubmission.findByPk(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Prevent resubmission
    if (submission.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Test already submitted",
      });
    }

    // 3️⃣ Get test
    const test = await Test.findByPk(submission.testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // 4️⃣ Check attempt limit
    if (submission.attemptNumber >= test.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: "Maximum attempts reached",
      });
    }

    // 5️⃣ Validate questions array
    if (!Array.isArray(test.questions) || test.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Test has no questions configured",
      });
    }

    // 6️⃣ Fetch questions correctly using Op.in
    const questions = await Question.findAll({
      where: {
        id: {
          [Op.in]: test.questions,
        },
      },
    });

    if (!questions.length) {
      return res.status(400).json({
        success: false,
        message: "Questions not found",
      });
    }

    // 7️⃣ Calculate marks
    let totalObtainedMarks = 0;

    for (let studentAnswer of answers) {
      const question = questions.find(
        (q) => String(q.id) === String(studentAnswer.questionId),
      );

      if (!question) continue;

      // MCQ Type
      if (question.questionType === "MCQ") {
        const studentAns = studentAnswer.selectedAnswer?.trim().toUpperCase();
        const correctAns = question.correctAnswer?.trim().toUpperCase();

        if (studentAns === correctAns) {
          totalObtainedMarks += Number(question.marks || 0);
        }
      }

      // TEXT Type
      if (question.questionType === "TEXT") {
        if (
          studentAnswer.selectedAnswer?.trim().toLowerCase() ===
          question.answerText?.trim().toLowerCase()
        ) {
          totalObtainedMarks += Number(question.marks || 0);
        }
      }
    }

    // 8️⃣ Calculate percentage
    const percentage =
      test.totalMarks > 0 ? (totalObtainedMarks / test.totalMarks) * 100 : 0;

    // 9️⃣ Update submission
    const updateData = {
      answers,
      obtainedMarks: totalObtainedMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      attemptNumber: submission.attemptNumber + 1,
      status: "SUBMITTED",
      submittedAt: new Date(),
    };

    await submission.update(updateData);

    // 1️⃣0️⃣ Fetch updated record
    const updatedSubmission = await TestSubmission.findByPk(submissionId);

    return res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Submit Test Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// New function to get test submissions for a teacher
export const getTeacherTestSubmissions = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        status: false,
        message: "Teacher ID is required",
      });
    }

    // Check if teacher exists
    const teacher = await Teacher.findOne({
      where: { teacherId },
      attributes: ["teacherId", "name"],
    });

    if (!teacher) {
      return res.status(404).json({
        status: false,
        message: "Teacher not found",
      });
    }

    // Get all test submissions for this teacherId directly
    const submissions = await TestSubmission.findAll({
      where: { teacherId },
      order: [["submittedAt", "DESC"]],
    });

    // Get unique testIds to fetch test data
    const testIds = [...new Set(submissions.map((s) => s.testId))];
    const tests = await Test.findAll({
      where: { id: testIds },
      attributes: ["id", "totalMarks", "title"],
    });
    const testMap = {};
    tests.forEach((t) => {
      testMap[t.id] = t;
    });

    if (submissions.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No test submissions found for this teacher",
        data: [],
        teacherId: teacherId,
        teacherName: teacher.name,
        totalSubmissions: 0,
      });
    }

    // Collect all questionIds from all submissions
    const allQuestionIds = [];

    submissions.forEach((sub) => {
      if (sub.answers) {
        let parsedAnswers = [];

        try {
          parsedAnswers =
            typeof sub.answers === "string"
              ? JSON.parse(sub.answers)
              : sub.answers;

          parsedAnswers.forEach((ans) => {
            if (!allQuestionIds.includes(ans.questionId)) {
              allQuestionIds.push(ans.questionId);
            }
          });
        } catch (err) {
          console.error("Answer parse error:", err);
        }
      }
    });

    // Fetch questions
    const questions = await Question.findAll({
      where: { id: allQuestionIds },
    });

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.id] = q;
    });

    // Format submissions
    const formattedSubmissions = submissions.map((sub) => {
      let parsedAnswers = [];

      if (sub.answers) {
        try {
          parsedAnswers =
            typeof sub.answers === "string"
              ? JSON.parse(sub.answers)
              : sub.answers;
        } catch (err) {
          parsedAnswers = [];
        }
      }

      const questionDetails = parsedAnswers
        .map((ans) => {
          const question = questionMap[ans.questionId];

          if (!question) return null;

          let correctAnswer =
            question.questionType === "TEXT"
              ? question.answerText
              : question.correctAnswer;

          // Handle both "A" and "optionA" formats for comparison
          let studentAnswer = ans.selectedAnswer;
          let normalizedCorrectAnswer = correctAnswer;

          if (question.questionType === "MCQ") {
            if (
              studentAnswer &&
              studentAnswer.length === 1 &&
              /^[A-D]$/.test(studentAnswer)
            ) {
              studentAnswer = `option${studentAnswer}`;
            }
            if (
              correctAnswer &&
              correctAnswer.length === 1 &&
              /^[A-D]$/.test(correctAnswer)
            ) {
              normalizedCorrectAnswer = `option${correctAnswer}`;
            }
          }

          const isCorrect =
            question.questionType === "TEXT"
              ? studentAnswer?.trim().toLowerCase() ===
                correctAnswer?.trim().toLowerCase()
              : studentAnswer === normalizedCorrectAnswer;

          return {
            questionId: question.id,
            questionText: question.questionText,
            questionType: question.questionType,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: correctAnswer,
            selectedAnswer: ans.selectedAnswer,
            isCorrect: isCorrect,
            marks: question.marks,
          };
        })
        .filter((q) => q !== null);

      const testInfo = testMap[sub.testId] || {};
      return {
        submissionId: sub.id,
        studentId: sub.studentId,
        testId: sub.testId,
        courseCode: sub.courseCode,
        totalMarks: testInfo.totalMarks || 0,
        title: testInfo.title || "N/A",
        attemptNumber: sub.attemptNumber,
        obtainedMarks: sub.obtainedMarks,
        percentage: sub.percentage,
        status: sub.status,
        submittedAt: sub.submittedAt,
        questionDetails: questionDetails,
        // Include test object for frontend compatibility
        test: {
          title: testInfo.title || "N/A",
          totalMarks: testInfo.totalMarks || 0,
        },
      };
    });

    // Group submissions by courseCode
    const submissionsByCourse = {};
    formattedSubmissions.forEach((sub) => {
      if (!submissionsByCourse[sub.courseCode]) {
        submissionsByCourse[sub.courseCode] = {
          courseCode: sub.courseCode,
          submissions: [],
        };
      }
      submissionsByCourse[sub.courseCode].submissions.push(sub);
    });

    const groupedData = Object.values(submissionsByCourse);

    return res.status(200).json({
      status: true,
      teacherId: teacher.teacherId,
      teacherName: teacher.name,
      totalSubmissions: formattedSubmissions.length,
      data: groupedData,
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

// Controller to update marks for a test submission and set status to GRADED
export const updateTestSubmissionMarks = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { obtainedMarks } = req.body;

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: "Submission ID is required",
      });
    }

    if (obtainedMarks === undefined || obtainedMarks === null) {
      return res.status(400).json({
        success: false,
        message: "obtainedMarks is required",
      });
    }

    // Find the submission
    const submission = await TestSubmission.findByPk(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Get the test to calculate percentage and potentially recalculate totalMarks
    const test = await Test.findByPk(submission.testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Get the questions to calculate total marks
    const questions = await Question.findAll({
      where: { id: test.questions },
    });

    // Calculate total marks from questions
    const calculatedTotalMarks = questions.reduce(
      (sum, question) => sum + question.marks,
      0,
    );

    // Check if we need to update the test's totalMarks
    // If the provided obtainedMarks is less than the question total marks, we should recalculate
    let newTotalMarks = test.totalMarks;
    let testUpdated = false;

    if (obtainedMarks < calculatedTotalMarks) {
      // Update the test's totalMarks to the calculated total
      newTotalMarks = calculatedTotalMarks;
      await test.update({ totalMarks: newTotalMarks });
      testUpdated = true;
    }

    // ---- Normalize obtainedMarks (can arrive as number/string or even an object from frontend) ----
    let normalizedObtainedMarks = obtainedMarks;
    if (normalizedObtainedMarks && typeof normalizedObtainedMarks === "object") {
      normalizedObtainedMarks =
        normalizedObtainedMarks.value ??
        normalizedObtainedMarks.obtainedMarks ??
        normalizedObtainedMarks.marks;
    }

    const numericObtainedMarks = Number(normalizedObtainedMarks);
    if (!Number.isFinite(numericObtainedMarks)) {
      return res.status(400).json({
        success: false,
        message: "obtainedMarks must be a number",
      });
    }

    // Calculate percentage
    const percentage =
      newTotalMarks > 0 ? (numericObtainedMarks / newTotalMarks) * 100 : 0;

    // Update the submission with new marks, percentage, and status
    await submission.update({
      obtainedMarks: parseInt(String(numericObtainedMarks), 10),
      percentage: parseFloat(percentage.toFixed(2)),
      status: "GRADED",
    });


    // Fetch the updated submission
    const updatedSubmission = await TestSubmission.findByPk(submissionId);

    return res.status(200).json({
      success: true,
      message: "Marks updated successfully and status set to GRADED",
      data: {
        submission: updatedSubmission,
        testUpdated: testUpdated,
        previousTotalMarks: test.totalMarks,
        newTotalMarks: newTotalMarks,
        calculatedQuestionTotalMarks: calculatedTotalMarks,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
