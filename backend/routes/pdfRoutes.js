const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { compressPDFRoute, getPDFTargets } = require('../controllers/pdfController');

// Public — exam-based size targets for frontend dropdown
router.get('/targets', getPDFTargets);

// Protected — compress PDF (1 credit)
router.post('/compress', protect, upload.single('pdf'), compressPDFRoute);

module.exports = router;