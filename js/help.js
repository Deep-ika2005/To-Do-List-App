// TaskMaster Pro - Help Page JavaScript

// DOM Elements
const searchInput = document.getElementById('searchInput');
const faqList = document.getElementById('faqList');

// Initialize help page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupFAQInteractions();
    console.log('❓ TaskMaster Pro Help Center Loaded');
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // FAQ interactions
    setupFAQInteractions();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// FAQ Interactions
function setupFAQInteractions() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('span:last-child');
            
            // Toggle answer visibility
            answer.classList.toggle('open');
            
            // Update icon
            if (answer.classList.contains('open')) {
                icon.textContent = '−';
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                icon.textContent = '+';
                answer.style.maxHeight = '0';
            }
        });
    });
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = 'block';
            
            // Highlight search term if found
            if (searchTerm && (question.includes(searchTerm) || answer.includes(searchTerm))) {
                item.style.background = 'rgba(147, 51, 234, 0.1)';
                item.style.borderColor = 'rgba(147, 51, 234, 0.3)';
            } else {
                item.style.background = '';
                item.style.borderColor = '';
            }
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show "no results" message if no items are visible
    const visibleItems = Array.from(faqItems).filter(item => item.style.display !== 'none');
    
    let noResultsMessage = document.getElementById('noResultsMessage');
    
    if (visibleItems.length === 0 && searchTerm) {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.id = 'noResultsMessage';
            noResultsMessage.className = 'text-center py-8 text-gray-400';
            noResultsMessage.innerHTML = `
                <div class="text-4xl mb-4">🔍</div>
                <h3 class="text-xl font-semibold mb-2">No results found</h3>
                <p>Try searching with different keywords or browse all topics below.</p>
            `;
            faqList.appendChild(noResultsMessage);
        }
        noResultsMessage.style.display = 'block';
    } else {
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        handleSearch();
        searchInput.blur();
    }
    
    // Enter to expand first visible FAQ item
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        const firstVisibleFAQ = document.querySelector('.faq-item[style*="display: block"], .faq-item:not([style*="display: none"])');
        if (firstVisibleFAQ) {
            firstVisibleFAQ.click();
        }
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add helpful animations
function addHelpfulAnimations() {
    // Animate FAQ items on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe FAQ items
    document.querySelectorAll('.faq-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
}

// Initialize animations
addHelpfulAnimations();

// Add copy functionality for code snippets (if any)
function addCopyFunctionality() {
    const codeBlocks = document.querySelectorAll('code, pre');
    
    codeBlocks.forEach(block => {
        if (block.textContent.trim().length > 10) {
            const copyButton = document.createElement('button');
            copyButton.className = 'absolute top-2 right-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors duration-300';
            copyButton.textContent = '📋 Copy';
            
            const wrapper = document.createElement('div');
            wrapper.className = 'relative';
            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);
            wrapper.appendChild(copyButton);
            
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    copyButton.textContent = '✅ Copied!';
                    setTimeout(() => {
                        copyButton.textContent = '📋 Copy';
                    }, 2000);
                });
            });
        }
    });
}

// Initialize copy functionality
addCopyFunctionality();

// Add feedback functionality
function addFeedbackFunctionality() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'mt-4 pt-4 border-t border-white/10 text-center';
        feedbackDiv.innerHTML = `
            <p class="text-sm text-gray-400 mb-2">Was this helpful?</p>
            <div class="flex justify-center space-x-2">
                <button class="feedback-btn px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors duration-300" data-feedback="yes">
                    👍 Yes
                </button>
                <button class="feedback-btn px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors duration-300" data-feedback="no">
                    👎 No
                </button>
            </div>
        `;
        
        const answer = item.querySelector('.faq-answer');
        answer.appendChild(feedbackDiv);
        
        // Handle feedback clicks
        feedbackDiv.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const feedback = btn.dataset.feedback;
                
                // Show thank you message
                feedbackDiv.innerHTML = `
                    <p class="text-sm text-green-400">
                        ${feedback === 'yes' ? '✅ Thank you for your feedback!' : '📝 Thank you! We\'ll work on improving this answer.'}
                    </p>
                `;
                
                // Log feedback (in a real app, this would be sent to analytics)
                console.log(`FAQ Feedback: ${item.querySelector('h3').textContent} - ${feedback}`);
            });
        });
    });
}

// Initialize feedback functionality
addFeedbackFunctionality();

// Add print functionality
function addPrintFunctionality() {
    const printButton = document.createElement('button');
    printButton.className = 'fixed bottom-4 left-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all duration-300 print:hidden';
    printButton.innerHTML = '🖨️ Print Guide';
    printButton.onclick = () => window.print();
    
    document.body.appendChild(printButton);
}

// Initialize print functionality
addPrintFunctionality();