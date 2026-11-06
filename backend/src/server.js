const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

// Test DB connection before starting listener
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to PostgreSQL database:', err.message);
    process.exit(1);
  }

  console.log('Connected to PostgreSQL successfully at:', res.rows[0].now);

  app.listen(PORT, () => {
    console.log(`Sweety Blood Glucose Tracker server running on port ${PORT}`);
  });
});
