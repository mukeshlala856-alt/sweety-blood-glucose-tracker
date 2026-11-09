const express = require('express');
const router = express.Router();
const {
  addReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} = require('../controllers/readingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', addReading);
router.get('/', getReadings);
router.get('/:id', getReadingById);
router.put('/:id', updateReading);
router.delete('/:id', deleteReading);

module.exports = router;
