const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules
const createSkillValidation = [
  body('skill_name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ max: 100 })
    .withMessage('Skill name must be less than 100 characters'),
];

const addHandymanSkillValidation = [
  body('skill_id')
    .notEmpty()
    .withMessage('Skill ID is required')
    .isInt({ min: 1 })
    .withMessage('Skill ID must be a positive integer'),
  body('experience')
    .notEmpty()
    .withMessage('Experience is required')
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer'),
];

const updateHandymanSkillValidation = [
  param('skillId')
    .isInt({ min: 1 })
    .withMessage('Skill ID must be a positive integer'),
  body('experience')
    .notEmpty()
    .withMessage('Experience is required')
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer'),
];

// Skill routes
router.get('/', skillController.getAllSkills);
router.post('/', authMiddleware, createSkillValidation, validate, skillController.createSkill);

// Handyman skill routes
router.post('/handyman', authMiddleware, addHandymanSkillValidation, validate, skillController.addHandymanSkill);
router.get('/handyman/:userId', skillController.getHandymanSkills);
router.put('/handyman/:skillId', authMiddleware, updateHandymanSkillValidation, validate, skillController.updateHandymanSkill);
router.delete('/handyman/:skillId', authMiddleware, skillController.deleteHandymanSkill);

module.exports = router;