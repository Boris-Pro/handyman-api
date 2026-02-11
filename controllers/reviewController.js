const db = require('../config/database');

// @desc    Create user review
// @route   POST /api/reviews/user
// @access  Private
const createUserReview = async (req, res, next) => {
  try {
    const { reviewee_id, review_text } = req.body;

    // Check if reviewing self
    if (req.user.userId === parseInt(reviewee_id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review yourself',
      });
    }

    // Check if reviewee exists
    const userExists = await db.query(
      'SELECT user_id FROM "User" WHERE user_id = $1',
      [reviewee_id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const result = await db.query(
      `INSERT INTO UserReview (reviewer_id, reviewee_id, review_text)
       VALUES ($1, $2, $3)
       RETURNING review_id, reviewer_id, reviewee_id, review_text, created_at`,
      [req.user.userId, reviewee_id, review_text]
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review: result.rows[0] },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this user',
      });
    }
    next(error);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT ur.review_id, ur.reviewer_id, ur.reviewee_id, ur.review_text, ur.created_at,
              u.first_name as reviewer_first_name, u.last_name as reviewer_last_name,
              p.profile_img_url as reviewer_profile_img
       FROM UserReview ur
       JOIN "User" u ON ur.reviewer_id = u.user_id
       LEFT JOIN UserProfileImage p ON ur.reviewer_id = p.user_id
       WHERE ur.reviewee_id = $1
       ORDER BY ur.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: { reviews: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user review
// @route   PUT /api/reviews/user/:reviewId
// @access  Private
const updateUserReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { review_text } = req.body;

    const result = await db.query(
      `UPDATE UserReview
       SET review_text = $1
       WHERE review_id = $2 AND reviewer_id = $3
       RETURNING review_id, reviewer_id, reviewee_id, review_text, created_at`,
      [review_text, reviewId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: { review: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user review
// @route   DELETE /api/reviews/user/:reviewId
// @access  Private
const deleteUserReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const result = await db.query(
      'DELETE FROM UserReview WHERE review_id = $1 AND reviewer_id = $2 RETURNING review_id',
      [reviewId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create work review
// @route   POST /api/reviews/work
// @access  Private
const createWorkReview = async (req, res, next) => {
  try {
    const { work_id, rating, review_text } = req.body;

    // Check if work exists
    const workExists = await db.query(
      'SELECT work_id, user_id FROM Work WHERE work_id = $1',
      [work_id]
    );

    if (workExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work not found',
      });
    }

    // Check if reviewing own work
    if (workExists.rows[0].user_id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review your own work',
      });
    }

    const result = await db.query(
      `INSERT INTO WorkReview (reviewer_id, work_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       RETURNING review_id, reviewer_id, work_id, rating, review_text, created_at`,
      [req.user.userId, work_id, rating, review_text]
    );

    res.status(201).json({
      success: true,
      message: 'Work review created successfully',
      data: { review: result.rows[0] },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this work',
      });
    }
    next(error);
  }
};

// @desc    Get reviews for a work
// @route   GET /api/reviews/work/:workId
// @access  Public
const getWorkReviews = async (req, res, next) => {
  try {
    const { workId } = req.params;

    const result = await db.query(
      `SELECT wr.review_id, wr.reviewer_id, wr.work_id, wr.rating, wr.review_text, wr.created_at,
              u.first_name as reviewer_first_name, u.last_name as reviewer_last_name,
              p.profile_img_url as reviewer_profile_img
       FROM WorkReview wr
       JOIN "User" u ON wr.reviewer_id = u.user_id
       LEFT JOIN UserProfileImage p ON wr.reviewer_id = p.user_id
       WHERE wr.work_id = $1
       ORDER BY wr.created_at DESC`,
      [workId]
    );

    // Calculate average rating
    const avgResult = await db.query(
      'SELECT AVG(rating) as average_rating FROM WorkReview WHERE work_id = $1',
      [workId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      average_rating: parseFloat(avgResult.rows[0].average_rating) || 0,
      data: { reviews: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update work review
// @route   PUT /api/reviews/work/:reviewId
// @access  Private
const updateWorkReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, review_text } = req.body;

    const result = await db.query(
      `UPDATE WorkReview
       SET rating = COALESCE($1, rating),
           review_text = COALESCE($2, review_text)
       WHERE review_id = $3 AND reviewer_id = $4
       RETURNING review_id, reviewer_id, work_id, rating, review_text, created_at`,
      [rating, review_text, reviewId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work review updated successfully',
      data: { review: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work review
// @route   DELETE /api/reviews/work/:reviewId
// @access  Private
const deleteWorkReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const result = await db.query(
      'DELETE FROM WorkReview WHERE review_id = $1 AND reviewer_id = $2 RETURNING review_id',
      [reviewId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUserReview,
  getUserReviews,
  updateUserReview,
  deleteUserReview,
  createWorkReview,
  getWorkReviews,
  updateWorkReview,
  deleteWorkReview,
};