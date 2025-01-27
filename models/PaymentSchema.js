const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  cardDetails: {
    cardNumber: String,
    expiryDate: String,
    cardHolderName: String,
  },
  status: { type: String, default: 'initialized' },
  promoCode: String,
  receipt: String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
