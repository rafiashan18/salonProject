const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/AppointmentSchema');
const Service = require('../models/ServiceSchema');
const User = require('../models/UserSchema');
const Employee = require('../models/EmployeeSchema');
const { authenticate, authorizeRole } = require('../middleware/Auth');


// POST /api/appointments - Book an appointment
router.post('/', authenticate, async (req, res) => {
  const { user, service, employee, appointmentDate, status } = req.body;
  if (![user, service, employee].every(id => mongoose.Types.ObjectId.isValid(id))) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  try {
    const newAppointment = new Appointment({
      user, service, employee, appointmentDate, status: status || 'pending'
    });
    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked', appointment: newAppointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments - Show all appointments for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/:id - Get appointment details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user service employee');
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/appointments/:id - Update an appointment
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user service employee');
    if (!updatedAppointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment updated', appointment: updatedAppointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/appointments/:id - Cancel an appointment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment canceled' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/reminders - Send reminders for upcoming appointments
router.post('/reminders', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.body.appointmentId).populate('user service');
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    // Reminder logic here (e.g., email/SMS)
    res.json({ message: 'Reminder sent successfully', appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/status/:id - Update appointment status
router.post('/status/:id', authenticate, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!updatedAppointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Status updated', appointment: updatedAppointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// POST /api/appointments/bulk-cancel - Cancel multiple appointments (admin-only)
router.post('/bulk-cancel', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await Appointment.deleteMany({ _id: { $in: req.body.appointmentIds } });
    res.json({ message: 'Appointments canceled', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/feedback/:id - Submit feedback for an appointment
router.post('/feedback/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    appointment.feedback = req.body.feedback;
    await appointment.save();
    res.json({ message: 'Feedback submitted', appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;
