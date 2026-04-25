const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { processImage, confirmDownload, getHistory, getExams } = require('../controllers/processController');

// Public — frontend uses this to populate exam dropdown with live specs
router.get('/exams', getExams);

// Protected — actual processing
router.post('/photo',     upload.single('image'), processImage);
router.post('/signature', upload.single('image'), processImage);
router.post('/confirm-download', protect, confirmDownload);

// History
router.get('/history', protect, getHistory);

module.exports = router;
