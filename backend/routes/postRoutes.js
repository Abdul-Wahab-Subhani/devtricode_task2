const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getCategories
} = require('../controllers/postController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getAllPosts);
router.get('/search', searchPosts);
router.get('/categories', getCategories);
router.get('/:id', getPostById);

// Protected routes (admin only)
router.post('/', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
