import { Review, Course, Teacher, Student, Enrollment } from '../../../models/index.js';
import sequelize from '../../../config/db.config.js';

import pkg from 'sequelize';
const { Op } = pkg;

/**
 * SUBMIT COURSE REVIEW
 * POST /api/reviews
 */
export const submitReview = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {

    const studentId = req.user?.studentId || req.body.studentId; 
    const { courseCode, ratingNumber, ratingComment } = req.body;

    if (!studentId || !courseCode || !ratingNumber) {
      await transaction.rollback();
      return res.status(400).json({ error: "studentId, courseCode, and ratingNumber are required." });
    }

    const ratingVal = Number(ratingNumber);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      await transaction.rollback();
      return res.status(400).json({ error: "Rating must be a number between 1 and 5 (inclusive)." });
    }

    const enrollment = await Enrollment.findOne({
      where: { studentId, courseCode,
        status: {
          [Op.in]: ["APPROVED", "PASSOUT"],
        }
       },
      transaction
    });

    if (!enrollment) {
      await transaction.rollback();
      return res.status(403).json({ error: "You must be enrolled in this course to review it." });
    }

    const teacherId = enrollment.teacherId;

    const existingReview = await Review.findOne({
      where: { studentId, courseCode },
      transaction
    });

    if (existingReview) {
      await transaction.rollback();
      return res.status(400).json({ error: "You have already reviewed this course." });
    }

    const review = await Review.create({
      studentId,
      courseCode,
      rating: ratingVal,
      comment: ratingComment || null
    }, { transaction });

    const course = await Course.findOne({ where: { courseCode }, transaction });
    if (course) {
      const oldTotal = course.totalReviews || 0;
      const oldAvg = course.rating || 0;

      const newTotal = oldTotal + 1;
      const newAvg = ((oldAvg * oldTotal) + ratingVal) / newTotal;

      await course.update({
        rating: parseFloat(newAvg.toFixed(1)),
        totalReviews: newTotal
      }, { transaction });
    }

    if (teacherId) {
      const teacher = await Teacher.findOne({ where: { teacherId }, transaction });
      if (teacher) {
        const oldTeacherTotal = teacher.totalReviews || 0;
        const oldTeacherAvg = teacher.rating || 0;

        const newTeacherTotal = oldTeacherTotal + 1;
        const newTeacherAvg = ((oldTeacherAvg * oldTeacherTotal) + ratingVal) / newTeacherTotal;

        await teacher.update({
          rating: parseFloat(newTeacherAvg.toFixed(1)),
          totalReviews: newTeacherTotal
        }, { transaction });
      }
    }

    await transaction.commit();
    return res.status(201).json({
      message: "Review submitted successfully",
      review
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error submitting review:", error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: error.errors?.[0]?.message || "Validation failed while submitting review."
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * GET /api/courses/:courseCode/reviews?page=1&limit=10
 */
export const getCourseReviews = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const course = await Course.findOne({
      where: { courseCode },
      attributes: ['courseCode', 'courseName', 'rating', 'totalReviews']
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { courseCode },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['studentId', 'name', 'profileImage']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const formattedReviews = reviews.map(r => ({
      reviewId: r.id,
      studentId: r.studentId,
      studentName: r.student ? r.student.name : "Anonymous",
      profileImage: r.student ? r.student.profileImage : null,
      ratingNumber: r.rating,
      ratingComment: r.comment,
      timestamp: r.createdAt
    }));

    return res.status(200).json({
      courseCode: course.courseCode,
      courseName: course.courseName,
      averageRating: course.rating,
      totalReviews: course.totalReviews,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      reviews: formattedReviews
    });

  } catch (error) {
    console.error("Error fetching course reviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * GET AVERAGE RATING (Course or Teacher)
 * GET /api/ratings/average?courseCode=XYZ OR ?teacherId=ABC
 */
export const getAverageRating = async (req, res) => {
  try {
    const { courseCode, teacherId } = req.query;

    // Strict validation: must provide one, and never both
    if ((courseCode && teacherId) || (!courseCode && !teacherId)) {
      return res.status(400).json({ 
        error: "Provide either 'courseCode' or 'teacherId' as a query parameter, but not both." 
      });
    }

    if (courseCode) {
      const course = await Course.findOne({
        where: { courseCode },
        attributes: ['courseCode', 'rating', 'totalReviews']
      });

      if (!course) return res.status(404).json({ error: "Course not found" });

      return res.status(200).json({
        targetId: course.courseCode,
        type: "course",
        rating: course.rating,
        totalReviews: course.totalReviews
      });
    }

    if (teacherId) {
      const teacher = await Teacher.findOne({
        where: { teacherId },
        attributes: ['teacherId', 'rating', 'totalReviews']
      });

      if (!teacher) return res.status(404).json({ error: "Teacher not found" });

      return res.status(200).json({
        targetId: teacher.teacherId,
        type: "teacher",
        rating: teacher.rating,
        totalReviews: teacher.totalReviews
      });
    }

  } catch (error) {
    console.error("Error fetching average rating:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * GET /api/admin/reviews?studentId=&courseCode=&teacherId=&page=1&limit=20
 */
export const adminGetAllReviews = async (req, res) => {
  try {
    const { studentId, courseCode } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (studentId) whereClause.studentId = studentId;
    if (courseCode) whereClause.courseCode = courseCode;

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', attributes: ['name', 'email'] },
        { model: Course, as: 'course', attributes: ['courseName'] }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      totalReviews: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      reviews: rows
    });

  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * DELETE /api/admin/reviews/:reviewId
 */
export const adminDeleteReview = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ where: { id: reviewId }, transaction });
    if (!review) {
      await transaction.rollback();
      return res.status(404).json({ error: "Review not found" });
    }

    const { courseCode, rating: deletedRating } = review;

    // Find assigned teacher via enrollment
    const enrollment = await Enrollment.findOne({
      where: { studentId: review.studentId, courseCode },
      transaction
    });
    const teacherId = enrollment ? enrollment.teacherId : null;

    // 1. Reverse update Course rating
    const course = await Course.findOne({ where: { courseCode }, transaction });
    if (course) {
      const oldTotal = course.totalReviews || 1;
      const oldAvg = course.rating || 0;

      const newTotal = oldTotal - 1;
      let newAvg = 0;
      if (newTotal > 0) {
        newAvg = ((oldAvg * oldTotal) - deletedRating) / newTotal;
      }

      await course.update({
        rating: parseFloat(newAvg.toFixed(1)),
        totalReviews: newTotal
      }, { transaction });
    }

    // 2. Reverse update Teacher rating
    if (teacherId) {
      const teacher = await Teacher.findOne({ where: { teacherId }, transaction });
      if (teacher) {
        const oldTeacherTotal = teacher.totalReviews || 1;
        const oldTeacherAvg = teacher.rating || 0;

        const newTeacherTotal = oldTeacherTotal - 1;
        let newTeacherAvg = 0;
        if (newTeacherTotal > 0) {
          newTeacherAvg = ((oldTeacherAvg * oldTeacherTotal) - deletedRating) / newTeacherTotal;
        }

        await teacher.update({
          rating: parseFloat(newTeacherAvg.toFixed(1)),
          totalReviews: newTeacherTotal
        }, { transaction });
      }
    }

    // 3. Delete the review
    await review.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Review deleted successfully and metrics updated." });

  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/reviews/has-reviewed
 */
export const hasStudentReviewed = async (req, res) => {
  const { studentId, courseCode } = req.body;

  if (!studentId || !courseCode) {
    return res.status(400).json({ error: "Both 'studentId' and 'courseCode' query parameters are required." });
  }

  try {
    const review = await Review.findOne({
      where: { studentId, courseCode }
    });

    return res.status(200).json({ hasReviewed: !!review });
  } catch (error) {
    console.error("Error checking review status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

};