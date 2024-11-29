const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Route to get the currently authenticated user's information
router.get('/me', auth, (req, res) => {
  if (req.user) {
    res.json(req.user); // Send the authenticated user's data
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error('Invalid login credentials');
    }
    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret');
    res.cookie('token', token, { httpOnly: true });
    res.send({ message: 'Logged in successfully', user: { _id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.send({ message: 'Logged out successfully' });
});

module.exports = router;

