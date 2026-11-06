const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Sweety Glucose Tracker - Core API Tests', () => {
  let token = '';
  let testUserId = null;
  const testEmail = `user_${Date.now()}@sweety.com`;
  const todayDate = new Date().toISOString().split('T')[0];

  // Close database connection after tests complete
  afterAll(async () => {
    if (testUserId) {
      await pool.query('DELETE FROM readings WHERE user_id = $1', [testUserId]);
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await pool.end();
  });

  // Test 1: User Registration
  it('1. Should register a new user and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Patient',
        email: testEmail,
        password: 'Password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token; // Save token for subsequent tests
    testUserId = res.body.user.id;
  });

  // Test 2: Add Valid Reading
  it('2. Should allow a logged-in user to add a valid reading', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reading_date: todayDate,
        time_slot: 'Morning (fasting)',
        glucose_value: 95,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.reading.glucose_value).toBe(95);
  });

  // Test 3: Validation Rule (Reject values > 600)
  it('3. Should reject glucose value greater than 600 mg/dl', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reading_date: todayDate,
        time_slot: 'After lunch',
        glucose_value: 700, // Invalid: exceeds 600
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  // Test 4: Daily Report
  it('4. Should fetch daily report with stats and readings', async () => {
    const res = await request(app)
      .get(`/api/reports/daily?date=${todayDate}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.has_data).toBe(true);
    expect(res.body.total_readings).toBeGreaterThanOrEqual(1);
    expect(res.body.readings).toBeDefined();
  });
});
