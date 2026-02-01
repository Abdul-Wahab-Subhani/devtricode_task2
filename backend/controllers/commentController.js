const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Get comments for a specific post
const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      postId: req.params.postId, 
      isApproved: true 
    }).sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new comment
const createComment = async (req, res) => {
  try {
    const { name, email, content } = req.body;
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      postId,
      name,
      email,
      content
    });

    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all comments (admin only)
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('postId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve comment (admin only)
const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.isApproved = true;
    await comment.save();
    
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete comment (admin only)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  getAllComments,
  approveComment,
  deleteComment
};
