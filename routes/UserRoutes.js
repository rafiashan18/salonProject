const express = require('express');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const { authenticate, authorizeRole } = require('../middleware/Auth'); 

const router = express.Router();

// POST /users/register - Register a new user (either user or admin))
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  const newUser = new User({ name, email, password, role });

  try {
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /users/login - Login a user and return a JWT token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    '1234_KEY', // Secret key, ideally stored in environment variables
    { expiresIn: '1h' } // Optional: Set an expiration time for the token
  );
res.json({ token });
});

// GET /users/profile - Fetch the profile of the currently logged-in user
router.get('/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});


router.get('/logout', authenticate, (req, res) => {
  res.json({ message: 'User logged out successfully' });
});

// Update user details
router.put('/update', authenticate, async (req, res) => {
  const { name, email } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    );
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Forgot password (request reset password email)
router.get('/forgot-password', async (req, res) => {
  const { email } = req.query;
  // Logic to send reset password email (mocked)
  res.json({ message: `Reset password link sent to ${email}` });
});

// Show list of all users (admin only)
router.get('/users', authenticate, authorizeRole('admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Show user by specific ID (admin only)
router.get('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete specific user account (admin only)
router.delete('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Block a user (admin only)
router.post('/block/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    res.json({ message: 'User blocked successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unblock a user (admin only)
router.post('/unblock/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
    res.json({ message: 'User unblocked successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Verify user email
router.post('/verify-email', authenticate, async (req, res) => {
  // Logic to verify email (mocked)
  res.json({ message: 'Email verified successfully' });
});

// Send email verification
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  // Logic to send verification email (mocked)
  res.json({ message: `Verification email sent to ${email}` });
});

module.exports = router;
