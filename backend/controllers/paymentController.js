const Razorpay    = require('razorpay');
const crypto      = require('crypto');
const User        = require('../models/User');
const Transaction = require('../models/Transaction');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Plan definitions — single source of truth ────────────────────────────────
// amount is in PAISE (₹1 = 100 paise)
const PLANS = {
  single:    { amount: 900,   credits: 1,   label: 'Single Fix',       validDays: null  },
  emergency: { amount: 1900,  credits: 15,  label: 'Emergency Pack',   validDays: 7     },
  unlimited: { amount: 2900,  credits: -1,  label: 'Daily Unlimited',  validDays: 30    }, // -1 = unlimited, FUP 50/day
  standard:  { amount: 5900,  credits: 60,  label: 'Standard',         validDays: 30    },
  pro:       { amount: 13900, credits: 150, label: 'Pro',              validDays: 90    },
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/payment/create-order
   Body: { planId }
───────────────────────────────────────────────────────────────────────────── */
const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan)
      return res.status(400).json({ message: `Invalid plan: "${planId}"` });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount:   plan.amount,
      currency: 'INR',
      receipt:  `rcpt_${planId}_${Date.now()}`,
      notes:    { planId, userId: req.user._id.toString() },
    });

    // Save pending transaction
    await Transaction.create({
      user:            req.user._id,
      razorpayOrderId: order.id,
      amount:          plan.amount,
      credits:         plan.credits,
      plan:            planId,
      planLabel:       plan.label,
      status:          'pending',
    });

    res.json({
      orderId:  order.id,
      amount:   plan.amount,    // paise
      currency: 'INR',
      planId,
      planLabel: plan.label,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error('[Payment] createOrder error:', err.message);
    res.status(500).json({ message: 'Could not create payment order. Try again.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/payment/verify
   Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
───────────────────────────────────────────────────────────────────────────── */
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // 1. Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature)
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });

    // 2. Find pending transaction
    const txn = await Transaction.findOne({ razorpayOrderId, status: 'pending' });
    if (!txn)
      return res.status(404).json({ message: 'Transaction not found.' });

    // 3. Mark as success
    txn.razorpayPaymentId = razorpayPaymentId;
    txn.status            = 'success';
    await txn.save();

    // 4. Add credits to user
    const plan = PLANS[txn.plan];
    let updatedUser;

    if (txn.credits === -1) {
      // Unlimited plan — set special flag
      updatedUser = await User.findByIdAndUpdate(
        txn.user,
        {
          $set: {
            plan:           txn.plan,
            planLabel:      plan.label,
            isUnlimited:    true,
            dailyOpsLimit:  50,
            planExpiry:     new Date(Date.now() + plan.validDays * 86400000),
          }
        },
        { new: true }
      );
    } else {
      // Credit-based plan
      updatedUser = await User.findByIdAndUpdate(
        txn.user,
        {
          $inc: { credits: txn.credits },
          $set: {
            plan:        txn.plan,
            planLabel:   plan.label,
            isUnlimited: false,
            planExpiry:  plan.validDays
              ? new Date(Date.now() + plan.validDays * 86400000)
              : null,
          }
        },
        { new: true }
      );
    }

    res.json({
      message:      'Payment successful!',
      credits:      updatedUser.credits,
      plan:         txn.plan,
      planLabel:    plan.label,
      isUnlimited:  updatedUser.isUnlimited || false,
      creditsAdded: txn.credits === -1 ? 'Unlimited' : txn.credits,
    });

  } catch (err) {
    console.error('[Payment] verifyPayment error:', err.message);
    res.status(500).json({ message: 'Payment verification failed on server.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/payment/history
   Returns user's payment history
───────────────────────────────────────────────────────────────────────────── */
const getHistory = async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user._id, status: 'success' })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch payment history.' });
  }
};

module.exports = { createOrder, verifyPayment, getHistory };