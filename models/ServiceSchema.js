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
    default: 0,  
  },
  discount: {
    type: Number,
    default: 0,  
  },
  availability: {
    type: Boolean,
    default: true,  
  },
  reviews: [String], 
}, {
  timestamps: true, 
  collection: 'services',
});

module.exports = mongoose.model('Service', serviceSchema);
