const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorizeRole } = require('../middleware/Auth');
const Payment=require('../models/PaymentSchema')
// Routes

// Initialize a payment session
router.post('/initialize', authenticate, async (req, res) => {
    const { amount, paymentMethod, cardDetails } = req.body;
    try {
      // Create Payment and ensure req.user._id is correctly passed
      const payment = new Payment({ user: req.user._id, amount, paymentMethod, cardDetails });
      await payment.save();
      res.json(payment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });


  router.post('/complete', authenticate, async (req, res) => {
    const { paymentId, status } = req.body;
  
    // Check if paymentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ error: 'Invalid paymentId format' });
    }
    
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
  
      payment.status = status === 'success' ? 'completed' : 'failed';
      await payment.save();
      res.json(payment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

  

// Show payment history for the user
router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id });
    res.json(payments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get payment status by paymentId
router.get('/status/:paymentId', authenticate, async (req, res) => {
    const { paymentId } = req.params;
  
    // Validate paymentId before querying the database
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ error: 'Invalid paymentId' });
    }
  
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
  
      res.json({ status: payment.status });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// Save card details for future payments (by updating the schema entry)
router.post('/save-card', authenticate, async (req, res) => {
  const { cardNumber, expiryDate, cardHolderName } = req.body;
  try {
    const cardDetails = { cardNumber, expiryDate, cardHolderName };
    const payment = new Payment({ user: req.user._id, amount: 0, paymentMethod: 'card', cardDetails });
    await payment.save();
    res.json({ message: 'Card details saved', cardDetails });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Show saved cards
router.get('/saved-cards', authenticate, async (req, res) => {
  try {
    const cards = await Payment.find({ user: req.user._id, 'cardDetails.cardNumber': { $ne: null } });
    res.json(cards.map(payment => payment.cardDetails));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a saved card
router.delete('/saved-card/:cardId', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { user: req.user._id, 'cardDetails.cardNumber': req.params.cardId },
      { $set: { cardDetails: null } }
    );
    if (!payment) return res.status(404).json({ error: 'Card not found' });
    res.json({ message: 'Card removed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Process a payment refund
router.post('/refund/:paymentId', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status === 'completed') {
      payment.status = 'refunded';
      await payment.save();
      res.json({ message: 'Refund processed', payment });
    } else {
      res.status(400).json({ error: 'Cannot refund this payment' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Display payment summary before checkout
router.get('/summary', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id, status: 'initialized' });
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    res.json({ total, payments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;
