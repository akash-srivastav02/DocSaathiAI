const express = require('express');
const router = express.Router();
const { compressPDF, imageToPdf, mergePdf, splitPdf } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Test route — confirms file loads correctly
router.get('/test', (req, res) => {
  res.json({ message: 'PDF route works' });
});

// POST /api/pdf/compress
router.post('/compress', upload.single('pdf'), compressPDF);
router.post('/image-to-pdf', upload.array('images', 20), imageToPdf);
router.post('/merge', upload.array('pdfs', 20), mergePdf);
router.post('/split', upload.single('pdf'), splitPdf);

module.exports = router;
