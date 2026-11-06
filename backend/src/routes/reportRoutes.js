const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// All report routes require authentication
router.use(authMiddleware);

router.get('/daily', getDailyReport);
router.get('/month-to-date', getMonthToDateReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
