const jwt = require('jsonwebtoken');

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, '1234_KEY'); // Replace with actual secret in prod
    console.log('Decoded Token:', decoded);  // Debugging log

    // Ensure that the id is valid and passed correctly
    req.user = { _id: decoded.id, role: decoded.role };  // Correct field name (_id)
    console.log('Authenticated user:', req.user);  // Log to verify req.user
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};


// Authorization middleware
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRole };
