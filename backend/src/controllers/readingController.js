const pool = require('../config/db');
const {
  validateGlucoseValue,
  validateReadingDate,
  validateTimeSlot,
} = require('../utils/validation');

// Add a new reading
const addReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reading_date, time_slot, glucose_value } = req.body;

    // 1. Validate glucose value
    const glucoseError = validateGlucoseValue(glucose_value);
    if (glucoseError) {
      return res.status(400).json({ message: glucoseError });
    }

    // 2. Validate reading date
    const dateError = validateReadingDate(reading_date);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    // 3. Validate time slot
    const slotError = validateTimeSlot(time_slot);
    if (slotError) {
      return res.status(400).json({ message: slotError });
    }

    // 4. Check if slot already recorded for this user on this date
    const existingSlotCheck = await pool.query(
      'SELECT id FROM readings WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3',
      [userId, reading_date, time_slot]
    );

    if (existingSlotCheck.rows.length > 0) {
      return res.status(400).json({
        message: `You already have an ${time_slot} reading for this date.`,
      });
    }

    // 5. Check daily limit (max 4 readings per day)
    const countCheck = await pool.query(
      'SELECT COUNT(*)::int AS count FROM readings WHERE user_id = $1 AND reading_date = $2',
      [userId, reading_date]
    );

    if (countCheck.rows[0].count >= 4) {
      return res.status(400).json({
        message: 'You can add only 4 readings per day.',
      });
    }

    // Insert reading
    const insertQuery = `
      INSERT INTO readings (user_id, reading_date, time_slot, glucose_value)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, time_slot, glucose_value, created_at, updated_at
    `;
    const result = await pool.query(insertQuery, [
      userId,
      reading_date,
      time_slot,
      parseInt(glucose_value, 10),
    ]);

    return res.status(201).json({
      message: 'Reading added successfully.',
      reading: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding reading:', error);
    return res.status(500).json({ message: 'Server error adding reading.' });
  }
};

// Get all readings for logged-in user (with optional date filter and pagination)
const getReadings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, page, limit } = req.query;

    let query = `
      SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, time_slot, glucose_value, created_at, updated_at
      FROM readings
      WHERE user_id = $1
    `;
    const params = [userId];

    if (date) {
      params.push(date);
      query += ` AND reading_date = $${params.length}`;
    }

    query += ' ORDER BY reading_date DESC, id DESC';

    // Optional pagination
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 20);
      const offset = (pageNum - 1) * limitNum;

      params.push(limitNum, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    const result = await pool.query(query, params);

    return res.status(200).json({ readings: result.rows });
  } catch (error) {
    console.error('Error fetching readings:', error);
    return res.status(500).json({ message: 'Server error fetching readings.' });
  }
};

// Get single reading by ID
const getReadingById = async (req, res) => {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;

    const query = `
      SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, time_slot, glucose_value, created_at, updated_at
      FROM readings
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [readingId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    return res.status(200).json({ reading: result.rows[0] });
  } catch (error) {
    console.error('Error fetching reading by ID:', error);
    return res.status(500).json({ message: 'Server error fetching reading.' });
  }
};

// Update an existing reading
const updateReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;
    const { reading_date, time_slot, glucose_value } = req.body;

    // Check if reading exists and belongs to this user
    const existing = await pool.query(
      "SELECT id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, time_slot, glucose_value FROM readings WHERE id = $1 AND user_id = $2",
      [readingId, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    // Validate inputs
    const targetDate = reading_date || existing.rows[0].reading_date;
    const targetSlot = time_slot || existing.rows[0].time_slot;
    const targetValue = glucose_value !== undefined ? glucose_value : existing.rows[0].glucose_value;

    const valueError = validateGlucoseValue(targetValue);
    if (valueError) {
      return res.status(400).json({ message: valueError });
    }

    const dateError = validateReadingDate(targetDate);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const slotError = validateTimeSlot(targetSlot);
    if (slotError) {
      return res.status(400).json({ message: slotError });
    }

    // Check duplicate slot if date or slot changed
    const duplicateCheck = await pool.query(
      'SELECT id FROM readings WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3 AND id != $4',
      [userId, targetDate, targetSlot, readingId]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        message: `You already have an ${targetSlot} reading for this date.`,
      });
    }

    const updateQuery = `
      UPDATE readings
      SET reading_date = $1, time_slot = $2, glucose_value = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, time_slot, glucose_value, created_at, updated_at
    `;
    const result = await pool.query(updateQuery, [
      targetDate,
      targetSlot,
      parseInt(targetValue, 10),
      readingId,
      userId,
    ]);

    return res.status(200).json({
      message: 'Reading updated successfully.',
      reading: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating reading:', error);
    return res.status(500).json({ message: 'Server error updating reading.' });
  }
};

// Delete a reading
const deleteReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;

    const result = await pool.query(
      'DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id',
      [readingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    return res.status(200).json({ message: 'Reading deleted successfully.' });
  } catch (error) {
    console.error('Error deleting reading:', error);
    return res.status(500).json({ message: 'Server error deleting reading.' });
  }
};

module.exports = {
  addReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
};
