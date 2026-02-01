// Test script to create a sample post for testing
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./backend/models/Post');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/professional-blog');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

const createSamplePost = async () => {
  try {
    await connectDB();
    
    const samplePost = new Post({
      title: "Welcome to Professional Blog",
      content: `This is a sample blog post created to test the single post functionality.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Key Features

- Modern design
- Responsive layout
- Professional functionality
- Easy to use

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.`,
      author: "Admin",
      summary: "A comprehensive introduction to our professional blog platform featuring modern design and advanced functionality.",
      category: "Technology",
      tags: ["blog", "web development", "technology", "introduction"],
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
      isPublished: true,
      views: 0
    });

    const savedPost = await samplePost.save();
    console.log('Sample post created successfully:');
    console.log('Post ID:', savedPost._id);
    console.log('Title:', savedPost.title);
    console.log('URL: http://localhost:3000/post/' + savedPost._id);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating sample post:', error);
    mongoose.disconnect();
  }
};

createSamplePost();
