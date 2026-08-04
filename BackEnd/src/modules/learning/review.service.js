const prisma = require("../../config/prisma");
const {
  getPaginationParams,
  getPaginationMeta,
} = require("../../utils/pagination");

/**
 * Create a course review. Student must be enrolled; one review per student per course.
 */
const createReview = async (studentId, courseId, data) => {
  const { rating, comment } = data;

  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
      },
    },
  });

  if (!enrollment) {
    throw new Error("You must be enrolled in this course to leave a review");
  }

  // Check for existing review
  const existingReview = await prisma.courseReview.findUnique({
    where: {
      courseId_studentId: {
        courseId: parseInt(courseId),
        studentId: parseInt(studentId),
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this course");
  }

  const review = await prisma.courseReview.create({
    data: {
      courseId: parseInt(courseId),
      studentId: parseInt(studentId),
      rating: parseInt(rating),
      comment: comment || null,
    },
    include: {
      student: {
        select: {
          userId: true,
          fullName: true,
          profileUrl: true,
        },
      },
    },
  });

  return review;
};

/**
 * Get paginated reviews for a course with student info
 */
const getReviewsByCourse = async (courseId, query) => {
  const { page, limit, skip, take } = getPaginationParams(query);

  const where = { courseId: parseInt(courseId) };

  const [reviews, total] = await Promise.all([
    prisma.courseReview.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            userId: true,
            fullName: true,
            userName: true,
            profileUrl: true,
          },
        },
      },
    }),
    prisma.courseReview.count({ where }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  return { reviews, pagination };
};

/**
 * Update own review
 */
const updateReview = async (reviewId, studentId, data) => {
  const review = await prisma.courseReview.findUnique({
    where: { reviewId: parseInt(reviewId) },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.studentId !== parseInt(studentId)) {
    throw new Error("You can only update your own review");
  }

  const updateData = {};
  if (data.rating !== undefined) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    updateData.rating = parseInt(data.rating);
  }
  if (data.comment !== undefined) {
    updateData.comment = data.comment;
  }

  const updated = await prisma.courseReview.update({
    where: { reviewId: parseInt(reviewId) },
    data: updateData,
    include: {
      student: {
        select: {
          userId: true,
          fullName: true,
          profileUrl: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Delete a review. Owner can delete own; admin can delete any.
 */
const deleteReview = async (reviewId, userId, userRole) => {
  const review = await prisma.courseReview.findUnique({
    where: { reviewId: parseInt(reviewId) },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.studentId !== parseInt(userId) && userRole !== "admin") {
    throw new Error("You can only delete your own review");
  }

  await prisma.courseReview.delete({
    where: { reviewId: parseInt(reviewId) },
  });

  return { message: "Review deleted successfully" };
};

/**
 * Get average rating and count for a course
 */
const getCourseRating = async (courseId) => {
  const result = await prisma.courseReview.aggregate({
    where: { courseId: parseInt(courseId) },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    courseId: parseInt(courseId),
    averageRating: result._avg.rating
      ? parseFloat(result._avg.rating.toFixed(2))
      : 0,
    totalReviews: result._count.rating,
  };
};

module.exports = {
  createReview,
  getReviewsByCourse,
  updateReview,
  deleteReview,
  getCourseRating,
};
