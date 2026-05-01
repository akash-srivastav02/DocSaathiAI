const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTracker,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/trackerController');

router.get('/', protect, getTracker);
router.post('/', protect, createApplication);
router.put('/:itemId', protect, updateApplication);
router.delete('/:itemId', protect, deleteApplication);

module.exports = router;
