const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createUserReviewValidation = [
  body('reviewee_id')
    .notEmpty()
    .withMessage('Reviewee ID is required')
    .isInt({ min: 1 })
    .withMessage('Reviewee ID must be a positive integer'),
  body('review_text')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ min: 10 })
    .withMessage('Review must be at least 10 characters long'),
];

const updateUserReviewValidation = [
  body('review_text')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ min: 10 })
    .withMessage('Review must be at least 10 characters long'),
];

const createWorkReviewValidation = [
  body('work_id')
    .notEmpty()
    .withMessage('Work ID is required')
    .isInt({ min: 1 })
    .withMessage('Work ID must be a positive integer'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review_text')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ min: 10 })
    .withMessage('Review must be at least 10 characters long'),
];

const updateWorkReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review_text')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Review must be at least 10 characters long'),
];

// User review routes
router.post('/user', authMiddleware, createUserReviewValidation, validate, reviewController.createUserReview);
router.get('/user/:userId', reviewController.getUserReviews);
router.put('/user/:reviewId', authMiddleware, updateUserReviewValidation, validate, reviewController.updateUserReview);
router.delete('/user/:reviewId', authMiddleware, reviewController.deleteUserReview);

// Work review routes
router.post('/work', authMiddleware, createWorkReviewValidation, validate, reviewController.createWorkReview);
router.get('/work/:workId', reviewController.getWorkReviews);
router.put('/work/:reviewId', authMiddleware, updateWorkReviewValidation, validate, reviewController.updateWorkReview);
router.delete('/work/:reviewId', authMiddleware, reviewController.deleteWorkReview);

module.exports = router;
