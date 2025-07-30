// Landing page JavaScript functionality

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const backToTop = document.getElementById('backToTop');
const navbar = document.getElementById('navbar');
const contactForm = document.getElementById('contactForm');

// Mobile menu toggle
mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            mobileMenu?.classList.add('hidden');
        }
    });
});

// Navbar scroll effect
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Navbar background opacity
    if (currentScrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.15)';
        navbar.style.backdropFilter = 'blur(15px)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
        navbar.style.backdropFilter = 'blur(10px)';
    }
    
    // Back to top button
    if (currentScrollY > 300) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
    } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'invisible';
    }
    
    lastScrollY = currentScrollY;
});

// Back to top functionality
backToTop?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Animated counter for statistics
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Trigger counter animation when stats section is visible
            if (entry.target.querySelector('[data-count]')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.scroll-animate, .feature-card');
    animatedElements.forEach(el => observer.observe(el));
});

// Contact form handling
contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = formData.get('name') || e.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const subject = formData.get('subject') || e.target.querySelectorAll('input[type="text"]')[1].value;
    const message = formData.get('message') || e.target.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Simulate form submission
    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
    contactForm.reset();
});

// Newsletter subscription
const newsletterForm = document.querySelector('footer .flex');
newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (!email) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    showNotification('Thank you for subscribing to our newsletter!', 'success');
    e.target.querySelector('input[type="email"]').value = '';
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-600', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-600', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-600', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                ✕
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Parallax effect for background elements
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    setTimeout(() => {
        const heroElements = document.querySelectorAll('#home .animate-fadeInUp, #home .animate-scaleIn');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) scale(1)';
            }, index * 200);
        });
    }, 500);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        mobileMenu?.classList.add('hidden');
    }
    
    // Enter key on buttons
    if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.target.click();
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll-dependent operations here
}, 16); // ~60fps

window.addEventListener('scroll', debouncedScrollHandler);

console.log('🚀 TaskMaster Pro Landing Page Loaded Successfully!');