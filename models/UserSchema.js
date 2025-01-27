const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true, 
    },
    email: {
      type: String,
      required: true, // The user's email is mandatory
      unique: true,   // Ensure emails are unique in the database
    },
    password: {
      type: String,
      required: true, // The hashed password is mandatory
    },
    role: {
      type: String,
      enum: ['user', 'admin'], 
      required: true, // The user's role is mandatory
    },
   
  }, {
    "collection":"Users"// Adds createdAt and updatedAt timestamps automatically
  });
  

  UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  });

  module.exports = mongoose.model('User', UserSchema);
