const mongoose=require('mongoose')
const appointmentSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Use the correct model name here
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service', // Ensure this is correct as well
      required: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'canceled'],
      default: 'pending'
    },
    feedback: {
      type: String
    },
  }, {
    timestamps: true,
  });
  
  module.exports = mongoose.model('Appointment', appointmentSchema);
  