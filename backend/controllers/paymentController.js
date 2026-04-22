const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  starter:  { amount: 4900,  credits: 25,  label: 'Starter 1yr' },
  pro:      { amount: 29900, credits: 100, label: 'Pro 1yr' },
  special:  { amount: 9900,  credits: 35,  label: 'Special 1mo' },
  removewm: { amount: 1000,  credits: 0,   label: 'Remove Watermark' }
};

// POST /api/payment/create-order
const createOrder = async (req, res) => {
  const { planType } = req.body;
  const plan = PLANS[planType];
  if (!plan) return res.status(400).json({ message: 'Invalid plan' });

  const order = await razorpay.orders.create({
    amount: plan.amount,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`
  });

  await Transaction.create({
    user: req.user._id,
    razorpayOrderId: order.id,
    amount: plan.amount,
    credits: plan.credits,
    plan: planType,
    status: 'pending'
  });

  res.json({ orderId: order.id, amount: plan.amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature)
    return res.status(400).json({ message: 'Payment verification failed' });

  const txn = await Transaction.findOneAndUpdate(
    { razorpayOrderId },
    { razorpayPaymentId, status: 'success' },
    { new: true }
  );

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { credits: txn.credits }
  });

  res.json({ message: 'Payment successful', credits: txn.credits });
};

module.exports = { createOrder, verifyPayment };