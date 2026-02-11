const db = require('../config/database');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getAllSkills = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT skill_id, skill_name FROM Skill ORDER BY skill_name'
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: { skills: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res, next) => {
  try {
    const { skill_name } = req.body;

    const result = await db.query(
      'INSERT INTO Skill (skill_name) VALUES ($1) RETURNING skill_id, skill_name',
      [skill_name]
    );

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { skill: result.rows[0] },
    });
  } catch (error) {
    if (error.code === '23505') {
      // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Skill already exists',
      });
    }
    next(error);
  }
};

// @desc    Add skill to handyman
// @route   POST /api/skills/handyman
// @access  Private
const addHandymanSkill = async (req, res, next) => {
  try {
    const { skill_id, experience } = req.body;

    // Check if skill exists
    const skillExists = await db.query(
      'SELECT skill_id FROM Skill WHERE skill_id = $1',
      [skill_id]
    );

    if (skillExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    // Add skill to handyman
    const result = await db.query(
      `INSERT INTO Handyman (user_id, skill_id, experience)
       VALUES ($1, $2, $3)
       RETURNING user_id, skill_id, experience`,
      [req.user.userId, skill_id, experience]
    );

    // Get skill details
    const skillResult = await db.query(
      `SELECT h.user_id, h.skill_id, h.experience, s.skill_name
       FROM Handyman h
       JOIN Skill s ON h.skill_id = s.skill_id
       WHERE h.user_id = $1 AND h.skill_id = $2`,
      [req.user.userId, skill_id]
    );

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: { handyman_skill: skillResult.rows[0] },
    });
  } catch (error) {
    if (error.code === '23505') {
      // Unique violation
      return res.status(400).json({
        success: false,
        message: 'You already have this skill',
      });
    }
    next(error);
  }
};

// @desc    Get handyman skills
// @route   GET /api/skills/handyman/:userId
// @access  Public
const getHandymanSkills = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT h.user_id, h.skill_id, h.experience, s.skill_name
       FROM Handyman h
       JOIN Skill s ON h.skill_id = s.skill_id
       WHERE h.user_id = $1
       ORDER BY s.skill_name`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: { skills: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update handyman skill experience
// @route   PUT /api/skills/handyman/:skillId
// @access  Private
const updateHandymanSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const { experience } = req.body;

    const result = await db.query(
      `UPDATE Handyman
       SET experience = $1
       WHERE user_id = $2 AND skill_id = $3
       RETURNING user_id, skill_id, experience`,
      [experience, req.user.userId, skillId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found for this handyman',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill experience updated successfully',
      data: { handyman_skill: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove skill from handyman
// @route   DELETE /api/skills/handyman/:skillId
// @access  Private
const deleteHandymanSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;

    const result = await db.query(
      'DELETE FROM Handyman WHERE user_id = $1 AND skill_id = $2 RETURNING user_id',
      [req.user.userId, skillId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found for this handyman',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  createSkill,
  addHandymanSkill,
  getHandymanSkills,
  updateHandymanSkill,
  deleteHandymanSkill,
};