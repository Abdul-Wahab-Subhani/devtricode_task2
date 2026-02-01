const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({
      username,
      email,
      password
    });

    await admin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};


const getDashboardStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ isPublished: true });
    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ isApproved: false });
    
    
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt views isPublished');

    
    const recentComments = await Comment.find()
      .populate('postId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name content createdAt isApproved postId');

    res.json({
      stats: {
        totalPosts,
        publishedPosts,
        totalComments,
        pendingComments
      },
      recentPosts,
      recentComments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAdminPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select('title summary createdAt views isPublished author');
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const verifyToken = async (req, res) => {
  try {
    res.json({
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const logoutAdmin = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
  getDashboardStats,
  getAdminPosts,
  verifyToken,
  logoutAdmin
};
