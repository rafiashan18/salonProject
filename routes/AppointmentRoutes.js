const express = require('express');
const router = express.Router();
const Appointment = require('../models/AppointmentSchema');
const Service = require('../models/ServiceSchema');
const User = require('../models/UserSchema');
const Employee = require('../models/EmployeeSchema');
const { authenticate, authorizeRole } = require('../middleware/Auth'); // Updated import

const mongoose = require('mongoose');

router.post('/', authenticate, async (req, res) => {
  const { user, service, employee, appointmentDate, status } = req.body;

  try {
    // Check if user, service, and employee are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(user) || 
        !mongoose.Types.ObjectId.isValid(service) || 
        !mongoose.Types.ObjectId.isValid(employee)) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }

    // Create and save the appointment
    const newAppointment = new Appointment({
      user, 
      service, 
      employee, 
      appointmentDate, 
      status: status || 'pending' // Default status to 'pending' if not provided
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// GET /api/appointments - Show all appointments for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id });
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/:id - Show details of a specific appointment
router.get('/:id', authenticate, async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id)
        .populate('user') // This will now correctly reference the 'User' model
        .populate('service')
        .populate('employee');
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
// PUT /api/appointments/:id - Update an appointment (e.g., reschedule)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user service employee');

    if (!updatedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/appointments/:id - Cancel an appointment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment canceled successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/available-slots - Check available slots for all services
router.get('/available-slots', authenticate, async (req, res) => {
  try {
    const services = await Service.find();
    const availableSlots = services.map(service => ({
      serviceId: service._id,
      availableSlots: service.schedule, // Assuming you have a schedule field in your service schema
    }));
    res.json(availableSlots);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/available-slots/:serviceId - Check available slots for a specific service
router.get('/available-slots/:serviceId', authenticate, async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service.schedule); // Return the available slots for the service
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/filter - Filter appointments by date, status, or service
router.post('/filter', authenticate, async (req, res) => {
  const { date, status, service } = req.body;

  try {
    const filterConditions = {};
    if (date) filterConditions.appointmentDate = date;
    if (status) filterConditions.status = status;
    if (service) filterConditions.service = service;

    const appointments = await Appointment.find(filterConditions).populate('user service employee');
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/reminders - Send reminders for upcoming appointments
router.post('/reminders', authenticate, async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId).populate('user service');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    // Logic for sending reminders (e.g., email/SMS)
    res.json({ message: 'Reminder sent successfully', appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/status/:id - Update the status of an appointment (e.g., confirmed, completed)
router.post('/status/:id', authenticate, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment status updated', appointment: updatedAppointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/today - Show appointments scheduled for today
router.get('/today', authenticate, async (req, res) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const tomorrow = new Date(today).setHours(23, 59, 59, 999);

  try {
    const appointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow },
    }).populate('user service employee');

    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/week - Show appointments scheduled for the current week
router.get('/week', authenticate, async (req, res) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the week
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week

  try {
    const appointments = await Appointment.find({
      appointmentDate: { $gte: startOfWeek, $lt: endOfWeek },
    }).populate('user service employee');

    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/month - Show appointments scheduled for the current month
router.get('/month', authenticate, async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1); // First day of the month
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1); // First day of next month

  try {
    const appointments = await Appointment.find({
      appointmentDate: { $gte: startOfMonth, $lt: endOfMonth },
    }).populate('user service employee');

    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/bulk-cancel - Cancel multiple appointments at once (admin-only)
router.post('/bulk-cancel', authenticate, authorizeRole('admin'), async (req, res) => {
  const { appointmentIds } = req.body;

  try {
    const result = await Appointment.deleteMany({ _id: { $in: appointmentIds } });
    res.json({ message: 'Appointments canceled successfully', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/appointments/feedback/:id - Submit feedback for a specific appointment
router.post('/feedback/:id', authenticate, async (req, res) => {
  const { feedback } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.feedback = feedback;
    await appointment.save();

    res.json({ message: 'Feedback submitted successfully', appointment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/appointments/revenue - Calculate revenue from appointments (admin-only)
router.get('/revenue', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const revenue = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$service.price' } } },
    ]);

    res.json({ totalRevenue: revenue[0]?.totalRevenue || 0 });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
