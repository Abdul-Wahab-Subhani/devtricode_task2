const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Get all published posts
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ isPublished: true });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post || !post.isPublished) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new post (admin only)
const createPost = async (req, res) => {
  try {
    const { title, content, summary, tags } = req.body;
    
    const post = new Post({
      title,
      content,
      summary,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.admin.username
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update post (admin only)
const updatePost = async (req, res) => {
  try {
    const { title, content, summary, tags, isPublished } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.summary = summary || post.summary;
    post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
    post.isPublished = isPublished !== undefined ? isPublished : post.isPublished;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete post (admin only)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete all comments for this post
    await Comment.deleteMany({ postId: req.params.id });
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search posts
const searchPosts = async (req, res) => {
  try {
    const { q, tags } = req.query;
    let query = { isPublished: true };

    if (q) {
      query.$text = { $search: q };
    }

    if (tags) {
      query.tags = { $in: tags.split(',').map(tag => tag.trim()) };
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Post.aggregate([
      { $match: { isPublished: true } },
      { $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          posts: { $push: '$$ROOT' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count,
        slug: cat._id.toLowerCase().replace(/\s+/g, ''),
        posts: cat.posts.slice(0, 3) // Only send first 3 posts for preview
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getCategories
};
