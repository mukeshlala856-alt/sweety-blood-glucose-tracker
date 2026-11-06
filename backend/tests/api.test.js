const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Sweety Blood Glucose Tracker API Tests', () => {
  let authToken = '';
  let testUserId = null;
  const testEmail = `test_${Date.now()}@sweety.com`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    // Clean test state
  });

  afterAll(async () => {
    // Clean up created test user and readings
    if (testUserId) {
      await pool.query('DELETE FROM readings WHERE user_id = $1', [testUserId]);
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await pool.end();
  });

  describe('1. Authentication Endpoints', () => {
    it('should register a new user successfully and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Patient',
          email: testEmail,
          password: testPassword,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testEmail);
      testUserId = res.body.user.id;
    });

    it('should not allow registering with an existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Patient',
          email: testEmail,
          password: testPassword,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User with this email already exists.');
    });

    it('should login the user and return a valid JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password.');
    });
  });

  describe('2. Glucose Reading CRUD & Validation Rules', () => {
    const todayStr = new Date().toISOString().split('T')[0];

    it('should reject reading without authentication', async () => {
      const res = await request(app)
        .get('/api/readings');

      expect(res.statusCode).toBe(401);
    });

    it('should validate: empty glucose value', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'Morning (fasting)',
          glucose_value: '',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Please enter a glucose value.');
    });

    it('should validate: value between 40 and 600 mg/dl (reject 700)', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'Morning (fasting)',
          glucose_value: 700,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    it('should validate: date cannot be in the future', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: '2099-12-31',
          time_slot: 'Morning (fasting)',
          glucose_value: 120,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Date cannot be in the future.');
    });

    it('should successfully add valid readings', async () => {
      const res1 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'Morning (fasting)',
          glucose_value: 95,
        });

      expect(res1.statusCode).toBe(201);
      expect(res1.body.reading.glucose_value).toBe(95);

      const res2 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'After breakfast',
          glucose_value: 140,
        });

      expect(res2.statusCode).toBe(201);
    });

    it('should validate: only one reading per slot per day', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'Morning (fasting)',
          glucose_value: 110,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('You already have an Morning (fasting) reading for this date.');
    });

    it('should validate: maximum 4 readings per day', async () => {
      // Add 3rd and 4th reading
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'After lunch',
          glucose_value: 130,
        });

      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'After dinner',
          glucose_value: 120,
        });

      // Try 5th reading on same date
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reading_date: todayStr,
          time_slot: 'Morning (fasting)', // Even if slot was different, daily cap is 4
          glucose_value: 115,
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('3. Reports Endpoints', () => {
    const todayStr = new Date().toISOString().split('T')[0];

    it('should fetch daily report with stats and readings list', async () => {
      const res = await request(app)
        .get(`/api/reports/daily?date=${todayStr}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.has_data).toBe(true);
      expect(res.body.total_readings).toBe(4);
      expect(res.body.highest).toBe(140);
      expect(res.body.lowest).toBe(95);
      expect(res.body.readings).toHaveLength(4);
    });

    it('should fetch month-to-date report', async () => {
      const res = await request(app)
        .get(`/api/reports/month-to-date?date=${todayStr}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.has_data).toBe(true);
      expect(res.body.total_readings).toBeGreaterThanOrEqual(4);
    });

    it('should show friendly empty state for dates with no readings', async () => {
      const res = await request(app)
        .get('/api/reports/daily?date=2020-01-01')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.has_data).toBe(false);
      expect(res.body.total_readings).toBe(0);
      expect(res.body.highest).toBeNull();
      expect(res.body.message).toBe('No readings recorded for this date.');
    });
  });
});
