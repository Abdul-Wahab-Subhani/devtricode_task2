// Professional Blog JavaScript
console.log('Professional Blog loaded successfully');

// Global variables
let currentPage = 1;
let currentPosts = [];
let allTags = new Set();
const API_BASE = '/api';

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
    }
};

// Load posts from API with enhanced error handling and loading states
const loadPosts = async (page = 1, search = '') => {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;
    
    // Show loading state
    postsGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <div class="loading-text">Loading amazing articles...</div>
        </div>
    `;
    
    try {
        let url = `${API_BASE}/posts?page=${page}&limit=6`;
        if (search) {
            url = `${API_BASE}/posts/search?q=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Small delay to show loading state (better UX)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (data.posts && data.posts.length > 0) {
            currentPosts = data.posts;
            displayPosts(data.posts);
            updateStats(data.posts);
        } else {
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>${search ? `No posts found for "${search}"` : 'No posts available'}</p>
                    ${search ? '<p style="font-size: 0.9rem; opacity: 0.7;">Try searching for something else</p>' : ''}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        postsGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Unable to load articles</p>
                <p style="font-size: 0.9rem; opacity: 0.7;">Please try refreshing the page</p>
                <button onclick="loadPosts(1)" style="
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">Try Again</button>
            </div>
        `;
    }
};

// Display posts in the grid with enhanced formatting
const displayPosts = (posts) => {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;
    
    if (!posts || posts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No posts to display</p>
            </div>
        `;
        return;
    }
    
    const postsHTML = posts.map((post, index) => {
        // Generate excerpt more intelligently
        let excerpt = '';
        if (post.summary) {
            excerpt = post.summary;
        } else if (post.content) {
            // Remove HTML tags and get clean text
            const cleanContent = post.content.replace(/<[^>]*>/g, '');
            excerpt = cleanContent.length > 150 ? cleanContent.substring(0, 150) + '...' : cleanContent;
        }
        
        // Format tags display
        const tagsHTML = post.tags && post.tags.length > 0 ? `
            <div class="post-tags">
                ${post.tags.slice(0, 3).map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                ${post.tags.length > 3 ? `<span class="post-tag">+${post.tags.length - 3} more</span>` : ''}
            </div>
        ` : '';
        
        return `
            <article class="post-card fade-in" style="animation-delay: ${index * 0.1}s;">
                <div class="post-image">
                    ${post.imageUrl ? 
                        `<img src="${post.imageUrl}" alt="${post.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"post-image-placeholder\\"><i class=\\"fas fa-newspaper\\"></i></div>';">` :
                        `<div class="post-image-placeholder">
                            <i class="fas fa-newspaper"></i>
                        </div>`
                    }
                    <div class="post-category-tag">${post.category || 'General'}</div>
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-author" title="Author">
                            <i class="fas fa-user"></i>
                            ${post.author || 'Anonymous'}
                        </span>
                        <span class="post-date" title="Published Date">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(post.createdAt)}
                        </span>
                        <span class="post-views" title="Views">
                            <i class="fas fa-eye"></i>
                            ${formatNumber(post.views || 0)}
                        </span>
                    </div>
                    <h3 class="post-title">
                        <a href="/post/${post._id}" title="${post.title}">${post.title || 'Untitled'}</a>
                    </h3>
                    <p class="post-excerpt">${excerpt}</p>
                    ${tagsHTML}
                    <div class="post-footer">
                        <a href="/post/${post._id}" class="read-more" title="Read full article">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="post-stats">
                            ${post.comments && post.comments.length > 0 ? `
                                <span title="Comments">
                                    <i class="fas fa-comments"></i>
                                    ${post.comments.length}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    postsGrid.innerHTML = postsHTML;
    
    // Trigger animation for new posts
    setTimeout(() => {
        document.querySelectorAll('.post-card').forEach(card => {
            card.classList.add('fade-in');
        });
    }, 100);
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

// Format number helper (e.g., 1234 -> 1.2K)
const formatNumber = (num) => {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

// Show alert messages
const showAlert = (message, type = 'success') => {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed; 
        top: 20px; 
        left: 50%; 
        transform: translateX(-50%); 
        background: ${type === 'error' ? '#dc3545' : '#28a745'}; 
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

// Admin functions
const handleAdminAccess = (event) => {
    event.preventDefault();
    window.location.href = '/adminLogin.html';
    return false;
};

const logout = () => {
    localStorage.clear();
    showAlert('Logged out successfully');
    setTimeout(() => window.location.href = '/', 1500);
};

// Load featured categories
const loadFeaturedCategories = async () => {
    try {
        const response = await fetch(`${API_BASE}/posts/categories`);
        if (!response.ok) throw new Error('Failed to load categories');
        
        const categories = await response.json();
        displayFeaturedCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
};

// Display featured categories
const displayFeaturedCategories = (categories) => {
    const categoriesGrid = document.getElementById('featuredCategories');
    if (!categoriesGrid || !categories || categories.length === 0) return;
    
    const categoryIcons = {
        technology: 'fas fa-microchip',
        development: 'fas fa-code',
        business: 'fas fa-briefcase',
        design: 'fas fa-paint-brush',
        science: 'fas fa-flask',
        general: 'fas fa-newspaper'
    };
    
    const categoriesHTML = categories.map(category => `
        <div class="category-card" onclick="window.location.href='/categories.html?category=${category.name.toLowerCase()}'">
            <div class="category-icon">
                <i class="${categoryIcons[category.name.toLowerCase()] || categoryIcons.general}"></i>
            </div>
            <h3 class="category-name">${category.name}</h3>
            <p class="category-count">${category.count} article${category.count !== 1 ? 's' : ''}</p>
        </div>
    `).join('');
    
    categoriesGrid.innerHTML = categoriesHTML;
};

// Newsletter subscription
const handleNewsletterSubmission = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    
    if (!email) {
        showAlert('Please enter your email address', 'error');
        return;
    }
    
    // Simulate newsletter subscription
    showAlert('Thank you for subscribing to our newsletter!', 'success');
    e.target.reset();
};

// Enhanced search with better visual feedback
const performSearch = (query) => {
    const searchResults = document.getElementById('searchResults');
    if (!query.trim()) {
        if (searchResults) searchResults.innerHTML = '';
        loadPosts(1);
        return;
    }
    
    if (searchResults) {
        searchResults.innerHTML = `
            <div class="search-info">
                <p>Searching for: <strong>${query}</strong></p>
            </div>
        `;
    }
    
    loadPosts(1, query);
};

// Back to Top functionality
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Show/hide back to top button
const handleBackToTop = () => {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
};

// Load footer categories dynamically
const loadFooterCategories = async () => {
    try {
        const response = await fetch(`${API_BASE}/posts/categories`);
        if (!response.ok) return;
        
        const categories = await response.json();
        const footerCategoriesEl = document.getElementById('footerCategories');
        
        if (footerCategoriesEl && categories && categories.length > 0) {
            const categoryHTML = categories.slice(0, 6).map(category => `
                <li>
                    <a href="/categories.html?category=${category.name.toLowerCase()}">
                        ${category.name}
                    </a>
                </li>
            `).join('');
            
            footerCategoriesEl.innerHTML = categoryHTML;
        }
    } catch (error) {
        console.error('Error loading footer categories:', error);
    }
};

// Single Post Page Functions
async function loadSinglePost() {
    try {
        // Extract post ID from URL (/post/123456)
        const postId = window.location.pathname.split('/').pop();
        if (!postId) {
            showPostError('Invalid post URL');
            return;
        }

        // Show loading state
        showPostLoading();

        // Fetch post data
        const response = await fetch(`${API_BASE}/posts/${postId}`);
        if (!response.ok) {
            if (response.status === 404) {
                showPostError('Post not found');
            } else {
                throw new Error('Failed to load post');
            }
            return;
        }

        const post = await response.json();

        // Update page title
        document.title = `${post.title} - Professional Blog`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && post.summary) {
            metaDesc.setAttribute('content', post.summary);
        }

        // Display post content
        displayPost(post);

    } catch (error) {
        console.error('Error loading post:', error);
        showPostError('Failed to load post. Please try again.');
    }
}

function showPostLoading() {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
        <div class="container">
            <div class="post-loading">
                <div class="loading">
                    <div class="spinner"></div>
                    <div class="loading-text">Loading article...</div>
                </div>
            </div>
        </div>
    `;
}

function showPostError(message) {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
        <div class="container">
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <div class="error-actions">
                    <a href="/" class="btn btn-primary">
                        <i class="fas fa-home"></i>
                        Go Home
                    </a>
                    <button class="btn btn-secondary" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i>
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    `;
}

function displayPost(post) {
    const main = document.querySelector('main');
    if (!main) return;

    const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    main.innerHTML = `
        <div class="container">
            <article class="single-post">
                <header class="post-header">
                    <div class="post-breadcrumb">
                        <a href="/">Home</a>
                        <i class="fas fa-chevron-right"></i>
                        <a href="/categories.html?category=${encodeURIComponent(post.category.toLowerCase())}">${post.category}</a>
                        <i class="fas fa-chevron-right"></i>
                        <span>${post.title}</span>
                    </div>
                    
                    <div class="post-category">
                        <a href="/categories.html?category=${encodeURIComponent(post.category.toLowerCase())}" class="category-tag">
                            ${post.category}
                        </a>
                    </div>
                    
                    <h1 class="post-title">${post.title}</h1>
                    
                    <div class="post-meta">
                        <div class="post-author">
                            <i class="fas fa-user"></i>
                            <span>By ${post.author}</span>
                        </div>
                        <div class="post-date">
                            <i class="fas fa-calendar"></i>
                            <time datetime="${post.createdAt}">${formattedDate}</time>
                        </div>
                        <div class="post-views">
                            <i class="fas fa-eye"></i>
                            <span>${(post.views || 0).toLocaleString()} views</span>
                        </div>
                        <div class="post-reading-time">
                            <i class="fas fa-clock"></i>
                            <span>${calculateReadingTime(post.content)} min read</span>
                        </div>
                    </div>
                    
                    ${post.imageUrl ? `
                        <div class="post-image">
                            <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
                        </div>
                    ` : ''}
                    
                    ${post.summary ? `
                        <div class="post-summary">
                            ${post.summary}
                        </div>
                    ` : ''}
                </header>
                
                <div class="post-content">
                    ${formatPostContent(post.content)}
                </div>
                
                <footer class="post-footer">
                    <div class="post-tags">
                        ${post.tags ? post.tags.map(tag => 
                            `<a href="/categories.html?search=${encodeURIComponent(tag)}" class="tag">#${tag}</a>`
                        ).join('') : ''}
                    </div>
                    
                    <div class="post-share">
                        <h4>Share this article</h4>
                        <div class="share-buttons">
                            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}" 
                               target="_blank" class="share-btn twitter" title="Share on Twitter">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
                               target="_blank" class="share-btn linkedin" title="Share on LinkedIn">
                                <i class="fab fa-linkedin"></i>
                            </a>
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
                               target="_blank" class="share-btn facebook" title="Share on Facebook">
                                <i class="fab fa-facebook"></i>
                            </a>
                            <button class="share-btn copy" onclick="copyToClipboard('${window.location.href}')" title="Copy link">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                    </div>
                </footer>
            </article>
            
            <section class="comments-section" id="commentsSection">
                <h3>Comments</h3>
                <div id="commentsContainer">
                    <!-- Comments will be loaded here -->
                </div>
            </section>
            
            <section class="related-posts">
                <h3>Related Articles</h3>
                <div id="relatedPostsContainer">
                    <!-- Related posts will be loaded here -->
                </div>
            </section>
        </div>
    `;
    
    // Load related posts
    loadRelatedPosts(post.category, post._id);
}

function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

function formatPostContent(content) {
    // Convert line breaks to paragraphs and format basic markdown-like syntax
    return content
        .split('\n\n')
        .map(paragraph => `<p>${paragraph.trim()}</p>`)
        .join('');
}

async function loadComments() {
    const commentsContainer = document.getElementById('commentsContainer');
    if (!commentsContainer) return;
    
    commentsContainer.innerHTML = `
        <div class="comments-placeholder">
            <div class="placeholder-icon">
                <i class="fas fa-comments"></i>
            </div>
            <h4>Comments Coming Soon</h4>
            <p>We're working on adding a comment system. Stay tuned!</p>
        </div>
    `;
}

async function loadRelatedPosts(category, currentPostId) {
    const relatedContainer = document.getElementById('relatedPostsContainer');
    if (!relatedContainer) return;
    
    try {
        const response = await fetch(`${API_BASE}/posts?category=${encodeURIComponent(category)}&limit=3`);
        const data = await response.json();
        const posts = data.posts.filter(post => post._id !== currentPostId).slice(0, 3);
        
        if (posts.length === 0) {
            relatedContainer.innerHTML = `
                <div class="no-related">
                    <p>No related articles found.</p>
                    <a href="/categories.html" class="btn btn-outline">Browse All Categories</a>
                </div>
            `;
            return;
        }
        
        relatedContainer.innerHTML = `
            <div class="related-posts-grid">
                ${posts.map(post => `
                    <article class="related-post-card">
                        ${post.imageUrl ? `
                            <div class="related-post-image">
                                <a href="/post/${post._id}">
                                    <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
                                </a>
                            </div>
                        ` : ''}
                        <div class="related-post-content">
                            <div class="related-post-category">
                                <a href="/categories.html?category=${encodeURIComponent(post.category.toLowerCase())}">${post.category}</a>
                            </div>
                            <h4 class="related-post-title">
                                <a href="/post/${post._id}">${post.title}</a>
                            </h4>
                            <p class="related-post-summary">${post.summary || ''}</p>
                            <div class="related-post-meta">
                                <span><i class="fas fa-user"></i> ${post.author}</span>
                                <span><i class="fas fa-eye"></i> ${(post.views || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading related posts:', error);
        relatedContainer.innerHTML = `
            <div class="error-loading-related">
                <p>Unable to load related articles.</p>
            </div>
        `;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        const btn = event.target.closest('.copy');
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
