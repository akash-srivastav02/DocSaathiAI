const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  amount:            { type: Number }, // in paise
  credits:           { type: Number }, // -1 = unlimited
  plan:              { type: String },
  planLabel:         { type: String },
  status: {
    type:    String,
    enum:    ['pending', 'success', 'failed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);