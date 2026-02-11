const db = require('../config/database');

// @desc    Create new work
// @route   POST /api/works
// @access  Private
const createWork = async (req, res, next) => {
  const client = await db.pool.connect();
  
  try {
    const { title, images } = req.body;

    await client.query('BEGIN');

    // Create work
    const workResult = await client.query(
      'INSERT INTO Work (user_id, title) VALUES ($1, $2) RETURNING work_id, user_id, title',
      [req.user.userId, title]
    );

    const work = workResult.rows[0];

    // Add images if provided
    if (images && images.length > 0) {
      const imageValues = images.map(img => `(${work.work_id}, '${img}')`).join(',');
      await client.query(
        `INSERT INTO WorkImage (work_id, work_img_url) VALUES ${imageValues}`
      );
    }

    // Get complete work with images
    const completeWork = await client.query(
      `SELECT w.work_id, w.user_id, w.title,
              COALESCE(
                json_agg(
                  json_build_object('work_img_url', wi.work_img_url)
                ) FILTER (WHERE wi.work_img_url IS NOT NULL),
                '[]'
              ) as images
       FROM Work w
       LEFT JOIN WorkImage wi ON w.work_id = wi.work_id
       WHERE w.work_id = $1
       GROUP BY w.work_id, w.user_id, w.title`,
      [work.work_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Work created successfully',
      data: { work: completeWork.rows[0] },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// @desc    Get all works by user
// @route   GET /api/works/user/:userId
// @access  Public
const getWorksByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT w.work_id, w.user_id, w.title,
              COALESCE(
                json_agg(
                  json_build_object('work_img_url', wi.work_img_url)
                ) FILTER (WHERE wi.work_img_url IS NOT NULL),
                '[]'
              ) as images,
              COUNT(wr.review_id) as review_count,
              COALESCE(AVG(wr.rating), 0) as average_rating
       FROM Work w
       LEFT JOIN WorkImage wi ON w.work_id = wi.work_id
       LEFT JOIN WorkReview wr ON w.work_id = wr.work_id
       WHERE w.user_id = $1
       GROUP BY w.work_id, w.user_id, w.title
       ORDER BY w.work_id DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: { works: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single work by ID
// @route   GET /api/works/:workId
// @access  Public
const getWorkById = async (req, res, next) => {
  try {
    const { workId } = req.params;

    const result = await db.query(
      `SELECT w.work_id, w.user_id, w.title,
              u.first_name, u.last_name,
              COALESCE(
                json_agg(
                  json_build_object('work_img_url', wi.work_img_url)
                ) FILTER (WHERE wi.work_img_url IS NOT NULL),
                '[]'
              ) as images
       FROM Work w
       JOIN "User" u ON w.user_id = u.user_id
       LEFT JOIN WorkImage wi ON w.work_id = wi.work_id
       WHERE w.work_id = $1
       GROUP BY w.work_id, w.user_id, w.title, u.first_name, u.last_name`,
      [workId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { work: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update work
// @route   PUT /api/works/:workId
// @access  Private
const updateWork = async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { title } = req.body;

    // Check if work belongs to user
    const workCheck = await db.query(
      'SELECT work_id FROM Work WHERE work_id = $1 AND user_id = $2',
      [workId, req.user.userId]
    );

    if (workCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work not found or unauthorized',
      });
    }

    const result = await db.query(
      'UPDATE Work SET title = $1 WHERE work_id = $2 RETURNING work_id, user_id, title',
      [title, workId]
    );

    res.status(200).json({
      success: true,
      message: 'Work updated successfully',
      data: { work: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work
// @route   DELETE /api/works/:workId
// @access  Private
const deleteWork = async (req, res, next) => {
  try {
    const { workId } = req.params;

    const result = await db.query(
      'DELETE FROM Work WHERE work_id = $1 AND user_id = $2 RETURNING work_id',
      [workId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add image to work
// @route   POST /api/works/:workId/images
// @access  Private
const addWorkImage = async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { work_img_url } = req.body;

    // Check if work belongs to user
    const workCheck = await db.query(
      'SELECT work_id FROM Work WHERE work_id = $1 AND user_id = $2',
      [workId, req.user.userId]
    );

    if (workCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work not found or unauthorized',
      });
    }

    await db.query(
      'INSERT INTO WorkImage (work_id, work_img_url) VALUES ($1, $2)',
      [workId, work_img_url]
    );

    res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: { work_img_url },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'This image already exists for this work',
      });
    }
    next(error);
  }
};

// @desc    Delete image from work
// @route   DELETE /api/works/:workId/images
// @access  Private
const deleteWorkImage = async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { work_img_url } = req.body;

    // Check if work belongs to user
    const workCheck = await db.query(
      'SELECT work_id FROM Work WHERE work_id = $1 AND user_id = $2',
      [workId, req.user.userId]
    );

    if (workCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work not found or unauthorized',
      });
    }

    const result = await db.query(
      'DELETE FROM WorkImage WHERE work_id = $1 AND work_img_url = $2 RETURNING work_id',
      [workId, work_img_url]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWork,
  getWorksByUser,
  getWorkById,
  updateWork,
  deleteWork,
  addWorkImage,
  deleteWorkImage,
};