const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const applicationSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  category:     { type: String, default: 'Government Exam', trim: true },
  status:       { type: String, default: 'Interested' },
  deadline:     { type: Date },
  officialLink: { type: String, trim: true },
  notes:        { type: String, trim: true, maxlength: 1200 },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },

  // Password — optional for Google OAuth users
  password: { type: String },

  // Google OAuth
  googleId: { type: String },
  avatar:   { type: String }, // Google profile picture URL

  // Credits & plan
  credits:      { type: Number, default: 15 },
  plan:         { type: String, default: 'free' },
  planLabel:    { type: String, default: 'Free' },
  isUnlimited:  { type: Boolean, default: false }, // Daily Unlimited plan
  dailyOpsLimit:{ type: Number, default: 50 },     // Max ops/day on unlimited plan
  dailyOpsUsed: { type: Number, default: 0 },      // Resets every day
  dailyOpsDate: { type: Date },                    // Last reset date
  planExpiry:   { type: Date },

  // Weekly free refill tracking
  lastWeeklyRefill: { type: Date },

  // Aspirant workspace
  applications: { type: [applicationSchema], default: [] },

  createdAt: { type: Date, default: Date.now },
});

// Hash password before save (only if modified and present)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false; // Google OAuth user has no password
  return bcrypt.compare(entered, this.password);
};

// Check if user can process (credits or unlimited plan)
userSchema.methods.canProcess = function (creditCost) {
  if (this.isUnlimited) {
    // Check daily limit
    const today = new Date().toDateString();
    const lastReset = this.dailyOpsDate ? this.dailyOpsDate.toDateString() : null;
    const opsUsed = lastReset === today ? this.dailyOpsUsed : 0;
    return opsUsed < this.dailyOpsLimit;
  }
  return this.credits >= creditCost;
};

module.exports = mongoose.model('User', userSchema);
