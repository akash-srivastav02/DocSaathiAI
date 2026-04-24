const jwt   = require('jsonwebtoken');
const User  = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helper ────────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userResponse = (user, token) => ({
  _id:         user._id,
  name:        user.name,
  email:       user.email,
  avatar:      user.avatar || null,
  credits:     user.credits,
  plan:        user.plan,
  planLabel:   user.planLabel,
  isUnlimited: user.isUnlimited,
  planExpiry:  user.planExpiry,
  token,
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/auth/signup
───────────────────────────────────────────────────────────────────────────── */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered. Please login.' });

    const user  = await User.create({ name, email, password, credits: 15 });
    const token = generateToken(user._id);

    res.status(201).json(userResponse(user, token));

  } catch (err) {
    console.error('[Auth] signup error:', err.message);
    res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/auth/login
───────────────────────────────────────────────────────────────────────────── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'No account found with this email.' });

    if (!(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Incorrect password.' });

    // Weekly free refill — give 5 credits if 7 days passed
    const now          = new Date();
    const lastRefill   = user.lastWeeklyRefill;
    const daysSince    = lastRefill
      ? (now - lastRefill) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSince >= 7) {
      user.credits         += 5;
      user.lastWeeklyRefill = now;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json(userResponse(user, token));

  } catch (err) {
    console.error('[Auth] login error:', err.message);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/auth/google
   Body: { credential } — Google ID token from frontend
───────────────────────────────────────────────────────────────────────────── */
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential)
      return res.status(400).json({ message: 'Google credential is required.' });

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Existing user — link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar   = picture;
        await user.save();
      }

      // Weekly free refill check
      const now       = new Date();
      const daysSince = user.lastWeeklyRefill
        ? (now - user.lastWeeklyRefill) / (1000 * 60 * 60 * 24)
        : 999;
      if (daysSince >= 7) {
        user.credits         += 5;
        user.lastWeeklyRefill = now;
        await user.save();
      }

    } else {
      // New user via Google — give 15 free credits
      user = await User.create({
        name,
        email,
        googleId,
        avatar:           picture,
        credits:          15,
        lastWeeklyRefill: new Date(),
      });
    }

    const token = generateToken(user._id);
    res.json(userResponse(user, token));

  } catch (err) {
    console.error('[Auth] googleAuth error:', err.message);
    res.status(401).json({ message: 'Google authentication failed. Please try again.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/auth/me
───────────────────────────────────────────────────────────────────────────── */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(userResponse(user, null));
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch user.' });
  }
};

module.exports = { signup, login, googleAuth, getMe };