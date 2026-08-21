import Review from '../../../models/Review.js';

export const createStudentReviewService = async (reviewData) => {
  return await Review.create(reviewData);
};

export const getStudentReviewsForCourseService = async (courseCode) => {
  return await Review.findAll({
    where: { courseCode },
    order: [['createdAt', 'DESC']],
  });
};
