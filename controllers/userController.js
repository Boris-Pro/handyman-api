const db = require('../config/database');

// @desc    Add phone number
// @route   POST /api/users/phone
// @access  Private
const addPhoneNumber = async (req, res, next) => {
  try {
    const { phone_number, is_primary } = req.body;

    // Check if phone number already exists
    const existingPhone = await db.query(
      'SELECT phone_id FROM UserPhoneNumber WHERE phone_number = $1',
      [phone_number]
    );

    if (existingPhone.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered',
      });
    }

    // If this is primary, unset other primary phones
    if (is_primary) {
      await db.query(
        'UPDATE UserPhoneNumber SET is_primary = FALSE WHERE user_id = $1',
        [req.user.userId]
      );
    }

    // Add phone number
    const result = await db.query(
      `INSERT INTO UserPhoneNumber (user_id, phone_number, is_primary)
       VALUES ($1, $2, $3)
       RETURNING phone_id, user_id, phone_number, is_primary, is_verified, added_at`,
      [req.user.userId, phone_number, is_primary || false]
    );

    res.status(201).json({
      success: true,
      message: 'Phone number added successfully',
      data: { phone: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update phone number
// @route   PUT /api/users/phone/:phoneId
// @access  Private
const updatePhoneNumber = async (req, res, next) => {
  try {
    const { phoneId } = req.params;
    const { phone_number, is_primary } = req.body;

    // Check if phone belongs to user
    const phoneCheck = await db.query(
      'SELECT phone_id FROM UserPhoneNumber WHERE phone_id = $1 AND user_id = $2',
      [phoneId, req.user.userId]
    );

    if (phoneCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    // If setting as primary, unset other primary phones
    if (is_primary) {
      await db.query(
        'UPDATE UserPhoneNumber SET is_primary = FALSE WHERE user_id = $1',
        [req.user.userId]
      );
    }

    // Update phone number
    const result = await db.query(
      `UPDATE UserPhoneNumber
       SET phone_number = COALESCE($1, phone_number),
           is_primary = COALESCE($2, is_primary)
       WHERE phone_id = $3 AND user_id = $4
       RETURNING phone_id, user_id, phone_number, is_primary, is_verified, added_at`,
      [phone_number, is_primary, phoneId, req.user.userId]
    );

    res.status(200).json({
      success: true,
      message: 'Phone number updated successfully',
      data: { phone: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete phone number
// @route   DELETE /api/users/phone/:phoneId
// @access  Private
const deletePhoneNumber = async (req, res, next) => {
  try {
    const { phoneId } = req.params;

    const result = await db.query(
      'DELETE FROM UserPhoneNumber WHERE phone_id = $1 AND user_id = $2 RETURNING phone_id',
      [phoneId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Phone number deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile image
// @route   PUT /api/users/profile-image
// @access  Private
const updateProfileImage = async (req, res, next) => {
  try {
    const { profile_img_url } = req.body;

    // Check if profile image exists
    const existingImage = await db.query(
      'SELECT user_id FROM UserProfileImage WHERE user_id = $1',
      [req.user.userId]
    );

    let result;
    if (existingImage.rows.length > 0) {
      // Update existing
      result = await db.query(
        `UPDATE UserProfileImage 
         SET profile_img_url = $1, uploaded_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING user_id, profile_img_url, uploaded_at`,
        [profile_img_url, req.user.userId]
      );
    } else {
      // Insert new
      result = await db.query(
        `INSERT INTO UserProfileImage (user_id, profile_img_url)
         VALUES ($1, $2)
         RETURNING user_id, profile_img_url, uploaded_at`,
        [req.user.userId, profile_img_url]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profile_image: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile image
// @route   DELETE /api/users/profile-image
// @access  Private
const deleteProfileImage = async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM UserProfileImage WHERE user_id = $1 RETURNING user_id',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile image not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  updateProfileImage,
  deleteProfileImage,
};