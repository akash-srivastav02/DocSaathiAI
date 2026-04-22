const express = require('express');
const router = express.Router();
const { compressPDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Test route — confirms file loads correctly
router.get('/test', (req, res) => {
  res.json({ message: 'PDF route works' });
});

// POST /api/pdf/compress
router.post('/compress', protect, upload.single('pdf'), compressPDF);

module.exports = router;