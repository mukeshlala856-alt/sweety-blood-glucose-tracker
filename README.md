# Sweety – Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking web application designed for diabetes patients to record daily glucose readings, monitor health trends, and generate comprehensive daily and monthly reports.

---

## 🚀 Tech Stack

- **Frontend**: React (TypeScript), Vite, CSS3, Axios, Recharts
- **Backend**: Node.js, Express.js (REST API)
- **Database**: PostgreSQL (connection pool with `pg`)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing
- **Testing**: Jest & Supertest

---

## 📋 Features

1. **User Authentication**:
   - Register with Name, Email, and Password.
   - Secure password hashing with bcrypt (salt rounds = 10).
   - JWT-based authentication with strict user data isolation (users only access their own readings).
   - One-click demo login button for fast testing.

2. **Readings Management (CRUD)**:
   - Record readings across 4 standard daily slots:
     - `Morning (fasting)`
     - `After breakfast`
     - `After lunch`
     - `After dinner`
   - Edit and Delete existing readings.
   - Clinical status indicators (Normal: 70–180 mg/dl, Low: < 70, High: > 180).

3. **Strict Validation Rules**:
   - Glucose value is required (`"Please enter a glucose value."`).
   - Whole number between 40 and 600 mg/dl (`"Value must be between 40 and 600 mg/dl."`).
   - Only one reading per slot per day (`"You already have an [Slot] reading for this date."`).
   - Maximum 4 readings per day (`"You can add only 4 readings per day."`).
   - Date cannot be in the future (`"Date cannot be in the future."`).

4. **Reports & Analytics**:
   - **Daily Report**: Shows highest, lowest, average (rounded to 1 decimal), and total count, plus breakdown of each recorded slot.
   - **Month-to-Date Report**: Calculates stats from the 1st of the month to the selected date.
   - **Monthly Report**: Calculates stats for the entire previous calendar month.
   - **Friendly Empty State**: Informative message when no readings exist for the selected period instead of broken zeros.
   - **Interactive Trend Chart**: Line chart powered by Recharts with clinical target boundaries.

---

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/mukeshlala856-alt/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Database Setup (PostgreSQL)
Create the database in PostgreSQL:
```sql
CREATE DATABASE sweety_glucose_db;
```
Run the database schema script:
```bash
psql -U postgres -d sweety_glucose_db -f backend/src/config/schema.sql
```

### 3. Backend Setup
Navigate to the `backend` directory and configure environment variables:
```bash
cd backend
cp .env.example .env
npm install
```

Ensure your `.env` contains your PostgreSQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=sweety_glucose_db
JWT_SECRET=sweety_super_secret_jwt_key_2026
```

### 4. Seed Demo Data
To populate the database with a demo user and sample readings across multiple dates:
```bash
npm run seed
```
**Demo User Credentials:**
- **Email:** `demo@sweety.com`
- **Password:** `Sweety@123`

### 5. Start Backend Server
```bash
npm run dev
# Server will run at http://localhost:5000
```

### 6. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Frontend will run at http://localhost:5173
```

---

## 🧪 Running Tests

Automated integration tests verify user registration, JWT authentication, reading validation rules, and report statistics:

```bash
cd backend
npm test
```

---

## 📝 Notes & Assumptions

- **Time Slots**: Fasting and post-meal windows correspond to standard clinical monitoring protocols (`Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`).
- **Previous Month Calculation**: Accurately computes the full calendar month preceding the selected date (including year rollover from January to December).
- **User Data Isolation**: Every reading and report SQL query strictly binds `WHERE user_id = $1` extracted from the verified JWT token.

### Future Improvements (Given More Time)
- Export reports to PDF / CSV for sharing with endocrinologists.
- Add email reminders for patients who have logged fewer than 4 readings in a day.
- Implement a Doctor/Clinician role allowing medical providers to view patient charts.
