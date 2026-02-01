// Simple, clean script.js for blog homepage
console.log('Script loaded at', new Date());

// Global variables
let currentPage = 1;
let currentPosts = [];
let allTags = new Set();

// API base URL
const API_BASE = '/api';

// Debug output function
const debugOutput = (message) => {
    console.log(message);
    const debugDiv = document.getElementById('debugOutput') || (() => {
        const div = document.createElement('div');
        div.id = 'debugOutput';
        div.style.cssText = 'position: fixed; top: 0; right: 0; background: yellow; padding: 10px; z-index: 9999; max-width: 300px; font-size: 12px; max-height: 300px; overflow-y: auto;';
        document.body.appendChild(div);
        return div;
    })();
    debugDiv.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
    debugDiv.scrollTop = debugDiv.scrollHeight;
};

// Update homepage stats
const updateStats = (posts) => {
    if (!posts) return;
    
    const totalPostsEl = document.getElementById('totalPostsCount');
    const totalViewsEl = document.getElementById('totalViewsCount');
    const totalCommentsEl = document.getElementById('totalCommentsCount');
    
    if (totalPostsEl) {
        totalPostsEl.textContent = posts.length;
        
        let totalViews = 0;
        let totalComments = 0;
        
        posts.forEach(post => {
            totalViews += post.views || 0;
            totalComments += (post.comments && post.comments.length) || 0;
        });
        
        if (totalViewsEl) totalViewsEl.textContent = totalViews;
        if (totalCommentsEl) totalCommentsEl.textContent = totalComments;
        
        debugOutput('Stats updated: ' + posts.length + ' posts, ' + totalViews + ' views, ' + totalComments + ' comments');
    }
};

// Load posts from API
const loadPosts = async (page = 1, search = '') => {
    debugOutput('loadPosts called with page: ' + page);
    
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) {
        debugOutput('ERROR: postsGrid not found!');
        return;
    }
    
    try {
        let url = `${API_BASE}/posts?page=${page}&limit=6`;
        if (search) {
            url = `${API_BASE}/posts/search?q=${encodeURIComponent(search)}`;
        }
        
        debugOutput('Fetching URL: ' + url);
        const response = await fetch(url);
        debugOutput('Response status: ' + response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        debugOutput('Data received, posts: ' + (data.posts ? data.posts.length : 'none'));
        
        if (data.posts && data.posts.length > 0) {
            currentPosts = data.posts;
            displayPosts(data.posts);
            updateStats(data.posts);
            debugOutput('Posts displayed successfully');
        } else {
            debugOutput('No posts found in response');
            postsGrid.innerHTML = '<div class="no-posts">No posts found in database</div>';
        }
        
    } catch (error) {
        debugOutput('Error loading posts: ' + error.message);
        postsGrid.innerHTML = '<div class="error">Error loading posts: ' + error.message + '</div>';
    }
};

// Display posts in the grid
const displayPosts = (posts) => {
    debugOutput('displayPosts called with ' + posts.length + ' posts');
    
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) {
        debugOutput('ERROR: postsGrid element not found!');
        return;
    }
    
    if (!posts || posts.length === 0) {
        postsGrid.innerHTML = '<div class="no-posts">No posts to display</div>';
        return;
    }
    
    // Simple HTML for posts
    const postsHTML = posts.map(post => `
        <div class="post-card" style="border: 1px solid #ddd; margin: 15px; padding: 20px; border-radius: 8px; background: white;">
            <h3 style="margin: 0 0 10px 0; color: #333;">
                <a href="/post/${post._id}" style="text-decoration: none; color: #2c5aa0;">${post.title || 'Untitled'}</a>
            </h3>
            <p style="color: #666; margin: 10px 0;">${post.summary || 'No summary available'}</p>
            <div style="font-size: 14px; color: #888;">
                <span>By ${post.author || 'Unknown'}</span> • 
                <span>${new Date(post.createdAt).toLocaleDateString()}</span> • 
                <span>${post.views || 0} views</span>
            </div>
        </div>
    `).join('');
    
    postsGrid.innerHTML = postsHTML;
    debugOutput('Posts HTML updated in postsGrid');
};

// Format date helper
const formatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

// Show alert messages
const showAlert = (message, type = 'success') => {
    debugOutput('Alert: ' + message);
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed; 
        top: 20px; 
        left: 50%; 
        transform: translateX(-50%); 
        background: ${type === 'error' ? '#ff4444' : '#44aa44'}; 
        color: white; 
        padding: 15px 25px; 
        border-radius: 5px; 
        z-index: 10000;
        font-weight: bold;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 4000);
};

// Mobile menu toggle
const toggleMobileMenu = () => {
    const nav = document.querySelector('.nav');
    if (nav) {
        nav.classList.toggle('mobile-menu-open');
    }
};

// Check authentication status
const checkAuthStatus = async () => {
    debugOutput('Checking auth status...');
    // Simple auth check - can be enhanced later
    return false;
};

// DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    debugOutput('=== DOM Content Loaded ===');
    
    // Check if this is the homepage
    const postsGrid = document.getElementById('postsGrid');
    if (postsGrid) {
        debugOutput('Homepage detected - loading posts...');
        loadPosts(1);
    } else {
        debugOutput('Not homepage - postsGrid not found');
    }
    
    // Set up basic event listeners
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            const query = searchInput ? searchInput.value.trim() : '';
            debugOutput('Search clicked with query: ' + query);
            loadPosts(1, query);
        });
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                debugOutput('Search enter pressed with query: ' + query);
                loadPosts(1, query);
            }
        });
    }
    
    debugOutput('=== Setup Complete ===');
});

// Simple admin functions for existing HTML
const handleAdminAccess = (event) => {
    event.preventDefault();
    debugOutput('Admin access attempted');
    return false;
};

const logout = () => {
    debugOutput('Logout clicked');
    showAlert('Logout functionality not implemented yet');
};

debugOutput('Script.js loaded successfully!');
