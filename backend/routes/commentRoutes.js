const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  createComment,
  getAllComments,
  approveComment,
  deleteComment
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Public routes
router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', createComment);

// Protected routes (admin only)
router.get('/', auth, getAllComments);
router.put('/:id/approve', auth, approveComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;
