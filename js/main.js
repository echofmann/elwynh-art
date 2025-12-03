// Main JavaScript for elwynh.com
document.addEventListener('DOMContentLoaded', function() {
    // Handle commission form submission
    const commissionForm = document.getElementById('commission-form');
    if (commissionForm) {
        commissionForm.addEventListener('submit', handleCommissionForm);
    }

    // Handle buy button clicks (when Stripe is integrated)
    const buyButtons = document.querySelectorAll('[data-price-id]');
    buyButtons.forEach(button => {
        button.addEventListener('click', handlePurchaseClick);
    });

    // Initialize gallery filtering
    initializeGalleryFiltering();

    // Initialize lightbox functionality
    initializeLightbox();

    // Add smooth scrolling for anchor links
    addSmoothScrolling();
    
    // Initialize any other interactive elements
    initializeGallery();
});

/**
 * Initialize lightbox functionality for artwork images
 * Updated to support dual image system (thumbnails vs full images)
 */
function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxInfo = document.getElementById('lightbox-info');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (!lightbox || !lightboxImage || !lightboxInfo || !lightboxClose) return;
    
    // Add click handlers to all artwork images
    const artworkImages = document.querySelectorAll('.image-container img');
    artworkImages.forEach(img => {
        img.addEventListener('click', function() {
            const title = this.dataset.title || this.alt;
            const info = this.dataset.info || '';
            
            // Use full-size image for lightbox, fallback to thumbnail if not available
            const fullImageSrc = this.dataset.fullImage || this.src;
            
            // Show loading state
            lightboxImage.style.opacity = '0.5';
            lightboxImage.src = fullImageSrc;
            lightboxImage.alt = this.alt;
            lightboxInfo.textContent = info;
            
            // Show lightbox
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Handle image load
            lightboxImage.onload = function() {
                lightboxImage.style.opacity = '1';
            };
            
            // Handle image load error (fallback to thumbnail)
            lightboxImage.onerror = function() {
                if (this.src !== img.src) {
                    console.warn('Full-size image failed to load, falling back to thumbnail:', fullImageSrc);
                    this.src = img.src; // Fallback to thumbnail
                } else {
                    console.error('Both full-size and thumbnail images failed to load');
                    this.alt = 'Image could not be loaded';
                }
                this.style.opacity = '1';
            };
        });
    });
    
    // Close lightbox when clicking the close button
    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close lightbox with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });
    
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        
        // Reset lightbox image
        lightboxImage.style.opacity = '1';
        lightboxImage.onload = null;
        lightboxImage.onerror = null;
    }
}

/**
 * Initialize gallery filtering functionality
 */
function initializeGalleryFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const artworkItems = document.querySelectorAll('.artwork-item');
    
    if (filterButtons.length === 0 || artworkItems.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter artwork items with smooth animation
            artworkItems.forEach(item => {
                const category = item.dataset.category;
                
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    // Add a slight delay for smooth appearance
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    // Hide after animation
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 200);
                }
            });
        });
    });
}

/**
 * Handle commission form submission
 * Updated for proper server submission with Ajax and fallback
 */
function handleCommissionForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Basic form validation
    const data = Object.fromEntries(formData.entries());
    if (!validateCommissionForm(data)) {
        return;
    }
    
    // Show loading state
    setButtonLoading(submitButton, true);
    
    // Submit via Ajax for better UX
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showSuccessMessage();
        } else {
            response.json().then(data => {
                if (data.errors) {
                    alert('There were errors with your submission:\n' + data.errors.map(error => error.message).join('\n'));
                } else {
                    throw new Error('Form submission failed');
                }
            });
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        
        // Fallback: try native form submission
        alert('Submitting form... Please wait for redirect.');
        form.submit();
    })
    .finally(() => {
        setButtonLoading(submitButton, false);
    });
}

/**
 * Validate commission form data
 * Updated for new form structure
 */
function validateCommissionForm(data) {
    const required = ['name', 'email', 'description', 'size'];
    
    for (let field of required) {
        if (!data[field] || data[field].trim() === '') {
            alert(`Please fill in the ${field.charAt(0).toUpperCase() + field.slice(1)} field.`);
            return false;
        }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    return true;
}

/**
 * Format email body for commission inquiry
 * Updated for new form structure
 */
function formatEmailBody(data, hasFiles = false) {
    return `
Commission Inquiry Details:

Name: ${data.name}
Email: ${data.email}
Size: ${data.size || 'Not specified'}
Location: ${data.location || 'Not specified'}

Project Description:
${data.description}

${hasFiles ? 'Note: Reference photos were uploaded with this inquiry.' : ''}

---
Sent from elwynh.com commission form
    `.trim();
}

/**
 * Show success message and hide form
 */
function showSuccessMessage() {
    const form = document.getElementById('commission-form');
    const successMessage = document.getElementById('form-success');
    
    if (form && successMessage) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Handle purchase button clicks (placeholder for Stripe integration)
 */
function handlePurchaseClick(event) {
    const button = event.target;
    const priceId = button.dataset.priceId;
    const amount = button.dataset.amount;
    const artworkTitle = button.closest('.artwork-item').querySelector('h3').textContent;
    
    // Temporarily disable Stripe integration and show message
    alert(`Purchase feature coming soon! 

Artwork: ${artworkTitle}
Price: ${button.textContent}

Please email hello@elwynh.com to inquire about this piece.`);
    
    // TODO: Implement Stripe Checkout
    // This will be replaced with actual Stripe integration
}

/**
 * Add smooth scrolling for anchor links
 */
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize gallery interactions and image handling
 */
function initializeGallery() {
    const artworkItems = document.querySelectorAll('.artwork-item');
    
    // Add loading states to images and enhanced error handling
    artworkItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            // Add loading class initially
            img.classList.add('loading');
            
            img.addEventListener('load', function() {
                this.classList.remove('loading');
                this.classList.add('loaded');
            });
            
            // Enhanced error handling for missing thumbnail images
            img.addEventListener('error', function() {
                console.warn('Thumbnail image failed to load:', this.src);
                
                // Create a placeholder SVG for missing thumbnails
                const placeholderSvg = createPlaceholderImage(
                    this.dataset.title || 'Artwork', 
                    '600', 
                    '600'
                );
                
                this.src = placeholderSvg;
                this.alt = `${this.dataset.title || 'Artwork'} - Image coming soon`;
                this.classList.remove('loading');
                this.classList.add('placeholder');
            });
        }
    });
    
    // Preload full-size images for better lightbox performance (optional)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    const fullImageSrc = img.dataset.fullImage;
                    
                    if (fullImageSrc) {
                        // Preload full-size image
                        const fullImg = new Image();
                        fullImg.src = fullImageSrc;
                    }
                    
                    imageObserver.unobserve(entry.target);
                }
            });
        });
        
        artworkItems.forEach(item => {
            imageObserver.observe(item);
        });
    }
}

/**
 * Create a placeholder SVG image for missing artwork
 */
function createPlaceholderImage(title, width, height) {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8f8f8" stroke="#e0e0e0" stroke-width="2"/>
            <text x="50%" y="40%" 
                  font-family="Georgia, serif" 
                  font-size="18" 
                  fill="#666" 
                  text-anchor="middle" 
                  dy="0.35em">${title}</text>
            <text x="50%" y="60%" 
                  font-family="Arial, sans-serif" 
                  font-size="14" 
                  fill="#999" 
                  text-anchor="middle" 
                  dy="0.35em">Image Coming Soon</text>
        </svg>
    `.trim();
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

/**
 * Utility function for future Stripe integration
 */
function formatPrice(cents) {
    return `$${(cents / 100).toFixed(0)}`;
}

/**
 * Utility function to show loading states
 */
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
    }
}

/**
 * Add some CSS for loading states and placeholders
 */
function addDynamicStyles() {
    const styles = `
        <style>
            .artwork-item img.loading {
                opacity: 0.6;
                filter: blur(1px);
            }
            
            .artwork-item img.loaded {
                opacity: 1;
                filter: none;
                transition: opacity 0.3s ease, filter 0.3s ease;
            }
            
            .artwork-item img.placeholder {
                opacity: 0.8;
            }
            
            .lightbox-content {
                transition: opacity 0.2s ease;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Add dynamic styles when DOM is ready
document.addEventListener('DOMContentLoaded', addDynamicStyles);
