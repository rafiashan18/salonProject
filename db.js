const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/salon_management'


mongoose.connect(mongoURL)
mongoose.set('debug', true);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = db;


