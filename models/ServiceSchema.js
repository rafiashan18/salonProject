const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['hair', 'nails', 'massage', 'facial', 'other'],  
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,  // Average rating, default to 0
  },
  discount: {
    type: Number,
    default: 0,  // Discount percentage (0 if no discount)
  },
  availability: {
    type: Boolean,
    default: true,  // Indicates if the service is available
  },
  reviews: [String], // Store reviews as an array of comments
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'services', // Specifies collection name
});

module.exports = mongoose.model('Service', serviceSchema);
