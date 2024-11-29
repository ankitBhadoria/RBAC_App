const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const router = express.Router();

// Get all users (admin and moderator only)
router.get('/', auth, rbac(['admin', 'moderator']), async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a user (admin can delete any user or moderator, but not other admins)
router.delete('/:id', auth, rbac(['moderator', 'admin']), async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Role-based deletion logic
    if (req.user.role === 'moderator' && userToDelete.role !== 'user') {
      // Moderators can only delete users
      return res.status(403).send({ error: 'Moderators can only delete users.' });
    }

    if (req.user.role === 'admin' && userToDelete.role === 'admin') {
      // Admins cannot delete other admins
      return res.status(403).send({ error: 'Admins cannot delete other admins.' });
    }

    // Delete all posts by the user
    await Post.deleteMany({ author: req.params.id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: 'User and their posts deleted successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Promote user to moderator (admin only)
router.post('/:id/promote', auth, rbac(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (user.role === 'admin' || user.role === 'moderator') {
      return res.status(400).send({ error: 'User is already an admin or moderator' });
    }

    user.role = 'moderator';
    await user.save();

    res.send({ message: 'User promoted to moderator successfully', user });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Demote moderator to user (admin only)
router.post('/:id/demote', auth, rbac(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).send({ error: 'Admins cannot be demoted' });
    }

    if (user.role === 'user') {
      return res.status(400).send({ error: 'User is already a regular user' });
    }

    user.role = 'user';
    await user.save();

    res.send({ message: 'Moderator demoted to user successfully', user });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

