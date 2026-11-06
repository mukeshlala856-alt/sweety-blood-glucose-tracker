const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../src/config/db');

async function seed() {
  console.log('--- Starting Sweety Database Seed ---');

  try {
    const demoEmail = 'demo@sweety.com';
    const demoPassword = 'Sweety@123';
    const demoName = 'Demo Patient';

    // 1. Check or create demo user
    let userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [demoEmail]);
    let userId;

    if (userResult.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(demoPassword, 10);
      const insertUser = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [demoName, demoEmail, hashedPassword]
      );
      userId = insertUser.rows[0].id;
      console.log(`Created demo user: ${demoEmail} (User ID: ${userId})`);
    } else {
      userId = userResult.rows[0].id;
      console.log(`Existing demo user found: ${demoEmail} (User ID: ${userId})`);
    }

    // 2. Clear old readings for demo user so seed is clean and idempotent
    await pool.query('DELETE FROM readings WHERE user_id = $1', [userId]);

    // 3. Sample readings across recent dates
    // Using current date dynamically to make reports meaningful
    const today = new Date();

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Calculate dates: today, yesterday, 5 days ago, and previous month
    const todayStr = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    const twoDaysAgoStr = formatDate(twoDaysAgo);

    // Date in previous month
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 15);
    const prevMonthDate2 = new Date(today.getFullYear(), today.getMonth() - 1, 20);
    const prevMonthStr1 = formatDate(prevMonthDate);
    const prevMonthStr2 = formatDate(prevMonthDate2);

    const sampleReadings = [
      // Today's readings (3 slots)
      { date: todayStr, slot: 'Morning (fasting)', value: 95 },
      { date: todayStr, slot: 'After breakfast', value: 130 },
      { date: todayStr, slot: 'After lunch', value: 125 },

      // Yesterday's readings (Full 4 slots)
      { date: yesterdayStr, slot: 'Morning (fasting)', value: 98 },
      { date: yesterdayStr, slot: 'After breakfast', value: 142 },
      { date: yesterdayStr, slot: 'After lunch', value: 138 },
      { date: yesterdayStr, slot: 'After dinner', value: 118 },

      // 2 days ago
      { date: twoDaysAgoStr, slot: 'Morning (fasting)', value: 92 },
      { date: twoDaysAgoStr, slot: 'After lunch', value: 128 },

      // Previous month readings (for previous month report)
      { date: prevMonthStr1, slot: 'Morning (fasting)', value: 104 },
      { date: prevMonthStr1, slot: 'After lunch', value: 145 },
      { date: prevMonthStr2, slot: 'Morning (fasting)', value: 99 },
      { date: prevMonthStr2, slot: 'After dinner', value: 122 },
    ];

    for (const r of sampleReadings) {
      await pool.query(
        `INSERT INTO readings (user_id, reading_date, time_slot, glucose_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot) DO UPDATE
         SET glucose_value = EXCLUDED.glucose_value`,
        [userId, r.date, r.slot, r.value]
      );
    }

    console.log(`Successfully seeded ${sampleReadings.length} readings for demo user.`);
    console.log('\n--- Seed Complete ---');
    console.log('Login credentials:');
    console.log('  Email:    demo@sweety.com');
    console.log('  Password: Sweety@123\n');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
