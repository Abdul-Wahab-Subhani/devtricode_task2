const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('public'));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/post/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/post.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/about.html'));
});

app.get('/categories.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/categories.html'));
});



// Auth middleware for HTML pages
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.redirect('/adminLogin.html');
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.redirect('/adminLogin.html');
  }
};

app.get('/adminLogin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/adminLogin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/adminLogin.html'));
});

app.get('/admin/dashboard', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

// API Routes
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the blog`);
});

module.exports = app;
