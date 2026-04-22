const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { processImage, getHistory, getExams } = require('../controllers/processController');

// Public — frontend uses this to populate exam dropdown with live specs
router.get('/exams', getExams);

// Protected — actual processing
router.post('/photo',     protect, upload.single('image'), processImage);
router.post('/signature', protect, upload.single('image'), processImage);

// History
router.get('/history', protect, getHistory);

module.exports = router;