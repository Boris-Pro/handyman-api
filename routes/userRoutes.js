const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const phoneValidation = [
  body('phone_number')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean'),
];

const profileImageValidation = [
  body('profile_img_url')
    .trim()
    .notEmpty()
    .withMessage('Profile image URL is required')
    .isURL()
    .withMessage('Must be a valid URL'),
];

// Phone number routes
router.post('/phone', authMiddleware, phoneValidation, validate, userController.addPhoneNumber);
router.put('/phone/:phoneId', authMiddleware, validate, userController.updatePhoneNumber);
router.delete('/phone/:phoneId', authMiddleware, userController.deletePhoneNumber);

// Profile image routes
router.put('/profile-image', authMiddleware, profileImageValidation, validate, userController.updateProfileImage);
router.delete('/profile-image', authMiddleware, userController.deleteProfileImage);

module.exports = router;