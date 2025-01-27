const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    enum: ['stylist', 'therapist', 'manager'],
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  schedule: {
    type: [String], 
    default: []
  },
  tasks: {
    type: [String],
    default: []
  },
  reviews: [{
    rating: { type: Number, required: true },
    comment: { type: String }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
