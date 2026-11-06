# Sweety - Blood Glucose Tracker

A full-stack blood glucose tracking web application built with **React**, **Node.js**, **Express**, and **PostgreSQL**.

The application allows diabetes patients to record up to 4 blood glucose readings per day, view their reading history, and analyze daily, month-to-date, and monthly health reports.

---

## Tech Stack

- **Frontend**: React (TypeScript), Vite, CSS / Bootstrap, Axios
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (`pg` pool)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing
- **Testing**: Jest & Supertest

---

## Features

- **User Authentication**: Secure user registration and login with encrypted passwords. Each user only accesses their own private readings.
- **Glucose Readings (CRUD)**: Add, view, edit, and delete blood glucose measurements across 4 standard daily slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- **Strict Validations**:
  - Value must be an integer between 40 and 600 mg/dl.
  - Maximum 4 readings per day (one per slot).
  - No future dates allowed.
- **Reports**:
  - Daily report with individual slot readings.
  - Month-to-date report.
  - Previous full calendar month report.
  - Metrics include: Highest, Lowest, Average (rounded to 1 decimal), and Total Readings.
  - Friendly empty state when no readings exist.

---

## Project Structure

```text
sweety-blood-glucose-tracker/
├── backend/            # Express REST API & PostgreSQL database config
│   ├── src/
│   │   ├── config/     # Database pool configuration
│   │   ├── controllers/# Business logic
│   │   ├── middleware/ # JWT authentication middleware
│   │   ├── routes/     # API routes
│   │   └── utils/      # Validation helpers
│   ├── scripts/        # Seed script for demo data
│   └── tests/          # API integration tests
├── frontend/           # React + TypeScript user interface
└── README.md
```
