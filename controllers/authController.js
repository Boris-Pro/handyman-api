const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Check if user exists
    const userExists = await db.query(
      'SELECT user_id FROM "User" WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      `INSERT INTO "User" (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id, first_name, last_name, email`,
      [first_name, last_name, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.user_id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await db.query(
      'SELECT user_id, first_name, last_name, email, password FROM "User" WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user.user_id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email,
              p.profile_img_url, p.uploaded_at as profile_img_uploaded
       FROM "User" u
       LEFT JOIN UserProfileImage p ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    // Get phone numbers
    const phoneResult = await db.query(
      `SELECT phone_id, phone_number, is_primary, is_verified, added_at
       FROM UserPhoneNumber
       WHERE user_id = $1
       ORDER BY is_primary DESC, added_at DESC`,
      [req.user.userId]
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          profile_img_url: user.profile_img_url,
          profile_img_uploaded: user.profile_img_uploaded,
          phone_numbers: phoneResult.rows,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name } = req.body;

    const result = await db.query(
      `UPDATE "User" 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name)
       WHERE user_id = $3
       RETURNING user_id, first_name, last_name, email`,
      [first_name, last_name, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};