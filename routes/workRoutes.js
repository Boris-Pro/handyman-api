const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const workController = require('../controllers/workController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createWorkValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
];

const updateWorkValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
];

const workImageValidation = [
  body('work_img_url')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Must be a valid URL'),
];

// Work routes
router.post('/', authMiddleware, createWorkValidation, validate, workController.createWork);
router.get('/user/:userId', workController.getWorksByUser);
router.get('/:workId', workController.getWorkById);
router.put('/:workId', authMiddleware, updateWorkValidation, validate, workController.updateWork);
router.delete('/:workId', authMiddleware, workController.deleteWork);

// Work image routes
router.post('/:workId/images', authMiddleware, workImageValidation, validate, workController.addWorkImage);
router.delete('/:workId/images', authMiddleware, workImageValidation, validate, workController.deleteWorkImage);

module.exports = router;