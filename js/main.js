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

    // Add smooth scrolling for anchor links
    addSmoothScrolling();
    
    // Initialize any other interactive elements
    initializeGallery();
});

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
