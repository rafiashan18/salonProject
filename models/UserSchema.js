const mongoose = require("./mongoose")
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
      firstName: String,
      lastName: String,
      phoneNumber: String,
      avatar: String
    },
    role: { 
      type: String, 
      enum: ['user', 'admin', 'staff'], 
      default: 'user' 
    },
    emailVerified: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  const userModel = mongoose.model('userModel', UserSchema)