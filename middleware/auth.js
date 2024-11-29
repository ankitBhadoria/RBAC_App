const jwt = require('jsonwebtoken'); // Library to handle JSON Web Tokens (JWT)
const User = require('../models/User');

// Authentication middleware function
const auth = async (req, res, next) => {
  try {
    // Retrieve the JWT token from cookies
    const token = req.cookies.token;

    if (!token) {
      throw new Error();
    }

    // Verify the token and decode its payload using the secret key
    const decoded = jwt.verify(token, 'your_jwt_secret');

    // Search for a user in the database with the ID stored in the token payload
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    // Attaching the token and user data to the request object for future use
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;
console.log('Auth middleware created successfully.');
