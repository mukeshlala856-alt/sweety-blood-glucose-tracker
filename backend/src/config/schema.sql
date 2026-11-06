-- Sweety Blood Glucose Tracker Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Readings table
CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_glucose_value CHECK (glucose_value BETWEEN 40 AND 600),
    CONSTRAINT valid_time_slot CHECK (time_slot IN (
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner'
    )),
    CONSTRAINT unique_user_date_slot UNIQUE (user_id, reading_date, time_slot)
);

-- Index on user_id and reading_date for fast querying in reports and dashboards
CREATE INDEX IF NOT EXISTS idx_readings_user_date ON readings (user_id, reading_date);
