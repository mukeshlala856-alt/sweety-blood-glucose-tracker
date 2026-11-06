const pool = require('../config/db');

// Helper to calculate previous month date range
const getPreviousMonthRange = (dateString) => {
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-12

  let prevYear = year;
  let prevMonth = month - 1;

  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const paddedPrevMonth = String(prevMonth).padStart(2, '0');
  const startDate = `${prevYear}-${paddedPrevMonth}-01`;

  // Last day of previous month
  const lastDay = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
  const endDate = `${prevYear}-${paddedPrevMonth}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
};

// Helper to calculate month-to-date range
const getMonthToDateRange = (dateString) => {
  const parts = dateString.split('-');
  const year = parts[0];
  const month = parts[1];

  const startDate = `${year}-${month}-01`;
  const endDate = dateString;

  return { startDate, endDate };
};

// Daily Report
const getDailyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0];

    // Get aggregated statistics
    const statsQuery = `
      SELECT
        COUNT(*)::int AS total_readings,
        MAX(glucose_value) AS highest,
        MIN(glucose_value) AS lowest,
        ROUND(AVG(glucose_value), 1)::float AS average
      FROM readings
      WHERE user_id = $1 AND reading_date = $2
    `;
    const statsResult = await pool.query(statsQuery, [userId, selectedDate]);
    const stats = statsResult.rows[0];

    // Get individual slot readings for this day
    const readingsQuery = `
      SELECT id, time_slot, glucose_value, created_at
      FROM readings
      WHERE user_id = $1 AND reading_date = $2
      ORDER BY id ASC
    `;
    const readingsResult = await pool.query(readingsQuery, [userId, selectedDate]);

    const hasData = stats.total_readings > 0;

    return res.status(200).json({
      report_type: 'Daily',
      date: selectedDate,
      has_data: hasData,
      total_readings: stats.total_readings,
      highest: hasData ? stats.highest : null,
      lowest: hasData ? stats.lowest : null,
      average: hasData ? stats.average : null,
      readings: readingsResult.rows,
      message: hasData ? null : 'No readings recorded for this date.',
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    return res.status(500).json({ message: 'Server error generating daily report.' });
  }
};

// Month-to-Date Report
const getMonthToDateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0];

    const { startDate, endDate } = getMonthToDateRange(selectedDate);

    const statsQuery = `
      SELECT
        COUNT(*)::int AS total_readings,
        MAX(glucose_value) AS highest,
        MIN(glucose_value) AS lowest,
        ROUND(AVG(glucose_value), 1)::float AS average
      FROM readings
      WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3
    `;
    const statsResult = await pool.query(statsQuery, [userId, startDate, endDate]);
    const stats = statsResult.rows[0];

    const hasData = stats.total_readings > 0;

    return res.status(200).json({
      report_type: 'Month-to-Date',
      start_date: startDate,
      end_date: endDate,
      has_data: hasData,
      total_readings: stats.total_readings,
      highest: hasData ? stats.highest : null,
      lowest: hasData ? stats.lowest : null,
      average: hasData ? stats.average : null,
      message: hasData ? null : 'No readings recorded for this period.',
    });
  } catch (error) {
    console.error('Error generating month-to-date report:', error);
    return res.status(500).json({ message: 'Server error generating month-to-date report.' });
  }
};

// Monthly (Previous Month) Report
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0];

    const { startDate, endDate } = getPreviousMonthRange(selectedDate);

    const statsQuery = `
      SELECT
        COUNT(*)::int AS total_readings,
        MAX(glucose_value) AS highest,
        MIN(glucose_value) AS lowest,
        ROUND(AVG(glucose_value), 1)::float AS average
      FROM readings
      WHERE user_id = $1 AND reading_date BETWEEN $2 AND $3
    `;
    const statsResult = await pool.query(statsQuery, [userId, startDate, endDate]);
    const stats = statsResult.rows[0];

    const hasData = stats.total_readings > 0;

    return res.status(200).json({
      report_type: 'Monthly (Previous Month)',
      start_date: startDate,
      end_date: endDate,
      has_data: hasData,
      total_readings: stats.total_readings,
      highest: hasData ? stats.highest : null,
      lowest: hasData ? stats.lowest : null,
      average: hasData ? stats.average : null,
      message: hasData ? null : 'No readings recorded for the previous month.',
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return res.status(500).json({ message: 'Server error generating monthly report.' });
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
};
