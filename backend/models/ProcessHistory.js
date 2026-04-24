const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toolType: { type: String, enum: ['photo', 'signature', 'crop', 'imgcompress', 'merger', 'pdfcompress', 'pdfeditor', 'resume'] },
  examName: String,
  originalUrl: String,
  processedUrl: String,
  creditsUsed: { type: Number, default: 1 },
  hasWatermark: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProcessHistory', historySchema);
