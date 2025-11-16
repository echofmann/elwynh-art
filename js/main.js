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
            
            lightboxImage.src = this.src;
            lightboxImage.alt = this.alt;
            lightboxInfo.textContent = info;
            
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
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
            
            // Filter artwork items
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
 * Currently uses mailto fallback - will be enhanced with proper backend later
 */
function handleCommissionForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Basic form validation
    if (!validateCommissionForm(data)) {
        return;
    }
    
    // Create email content
    const emailSubject = `Commission Inquiry: ${data.project_type || 'Custom Project'}`;
    const emailBody = formatEmailBody(data);
    
    // Use mailto as fallback (will be replaced with proper submission later)
    const mailtoLink = `mailto:hello@elwynh.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    try {
        window.location.href = mailtoLink;
        showSuccessMessage();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Sorry, there was an error submitting your inquiry. Please try emailing hello@elwynh.com directly.');
    }
}

/**
 * Validate commission form data
 */
function validateCommissionForm(data) {
    const required = ['name', 'email', 'description'];
    
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
 */
function formatEmailBody(data) {
    return `
Commission Inquiry Details:

Name: ${data.name}
Email: ${data.email}
Project Type: ${data.project_type || 'Not specified'}
Budget Range: ${data.budget || 'Not specified'}
Timeline: ${data.timeline || 'Not specified'}
Location: ${data.location || 'Not specified'}

Project Description:
${data.description}

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
    // This will be replaced with actual Stripe integration in Step 4
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
 * Initialize gallery interactions
 */
function initializeGallery() {
    const artworkItems = document.querySelectorAll('.artwork-item');
    
    // Add loading states to images
    artworkItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            
            // Add error handling for missing images
            img.addEventListener('error', function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOGY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgQ29taW5nIFNvb248L3RleHQ+PC9zdmc+';
                this.alt = 'Image coming soon';
            });
        }
    });
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
