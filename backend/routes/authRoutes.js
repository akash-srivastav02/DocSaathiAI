const express = require('express');
const router  = express.Router();
const { signup, login, googleAuth, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login',  login);
router.post('/google', googleAuth);   // ← Google OAuth
router.get('/me',      protect, getMe);

// ── DEV ONLY: manual credit top-up — remove before production ──────────────
if (process.env.NODE_ENV !== 'production') {
  const User = require('../models/User');
  router.post('/dev/add-credits', protect, async (req, res) => {
    const amount = parseInt(req.body.amount) || 100;
    const user   = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { credits: amount } },
      { new: true }
    );
    res.json({ message: `Added ${amount} credits`, credits: user.credits });
  });
}

module.exports = router;