const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a post (all authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user._id
    });
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all posts (all authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username role');
    res.send(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send(error);
  }
});

// Delete a post (owner, moderator, or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString() &&
      (req.user.role === 'moderator' && postAuthor.role !== 'user') && (req.user.role === 'admin' && postAuthor.role === 'admin')) {
      return res.status(403).send({ error: 'Not authorized to delete this post' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.send({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

