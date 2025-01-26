const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const { authenticate, authorizeRole } = require('../middleware/Auth'); 

const router = express.Router();
router.get('/greetings',(req,res)=>{
    res.status(201).json({ message: 'HIII' });

})
// POST /users/register - Register a new user (either student or supervisor)
router.post('/register', async (req, res) => {
    console.log("entered function")
  const { name, email, password, role } = req.body;

  const newUser = new User({ name, email, password, role });

  try {
    console.log("entered Try")
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;