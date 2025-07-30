// TaskMaster Pro - Main Application JavaScript

// Application State
let tasks = [];
let nextId = 1;
let currentFilter = 'all';
let currentSort = 'newest';
let settings = {
    darkMode: true,
    soundEffects: true,
    animations: true,
    autoSave: true,
    notifications: true,
    defaultPriority: 'medium',
    defaultCategory: 'other'
};

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskModal = document.getElementById('taskModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const celebrationModal = document.getElementById('celebrationModal');
const closeCelebration = document.getElementById('closeCelebration');
const notifications = document.getElementById('notifications');

// Stats elements
const totalTasks = document.getElementById('totalTasks');
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');
const completionRate = document.getElementById('completionRate');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    renderTasks();
    updateStats();
    
    // Set default values
    categorySelect.value = settings.defaultCategory;
    prioritySelect.value = settings.defaultPriority;
    
    console.log('✅ TaskMaster Pro App Initialized');
});

// Event Listeners
function setupEventListeners() {
    // Task form submission
    taskForm.addEventListener('submit', handleAddTask);
    
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Sort functionality
    sortSelect.addEventListener('change', handleSort);
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });
    
    // Clear completed tasks
    clearCompleted.addEventListener('click', handleClearCompleted);
    
    // Modal controls
    closeModal.addEventListener('click', closeTaskModal);
    closeCelebration.addEventListener('click', closeCelebrationModal);
    
    // Close modals on outside click
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeTaskModal();
    });
    
    celebrationModal.addEventListener('click', (e) => {
        if (e.target === celebrationModal) closeCelebrationModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Task Management Functions
function handleAddTask(e) {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    if (!taskText) {
        showNotification('Please enter a task description', 'error');
        taskInput.classList.add('animate-shake');
        setTimeout(() => taskInput.classList.remove('animate-shake'), 500);
        return;
    }
    
    const newTask = {
        id: nextId++,
        text: taskText,
        category: categorySelect.value,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || null,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    tasks.unshift(newTask);
    saveData();
    renderTasks();
    updateStats();
    
    // Reset form
    taskForm.reset();
    categorySelect.value = settings.defaultCategory;
    prioritySelect.value = settings.defaultPriority;
    
    // Show success notification
    showNotification('Task added successfully! 🎉', 'success');
    
    // Play sound effect
    if (settings.soundEffects) {
        playSound('add');
    }
    
    // Focus back to input
    taskInput.focus();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    
    saveData();
    renderTasks();
    updateStats();
    
    if (task.completed) {
        showCelebrationModal();
        showNotification('Great job! Task completed! ✅', 'success');
        if (settings.soundEffects) {
            playSound('complete');
        }
    } else {
        showNotification('Task marked as pending', 'info');
    }
}

function deleteTask(id) {
    if (settings.confirmDelete) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
    }
    
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
    updateStats();
    
    showNotification('Task deleted', 'info');
    if (settings.soundEffects) {
        playSound('delete');
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    showTaskModal(task);
}

function updateTask(id, updates) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    Object.assign(task, updates);
    saveData();
    renderTasks();
    updateStats();
    closeTaskModal();
    
    showNotification('Task updated successfully', 'success');
}

// Filtering and Sorting
function handleFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTasks();
}

function handleSearch() {
    renderTasks();
}

function handleSort() {
    currentSort = sortSelect.value;
    renderTasks();
}

function getFilteredTasks() {
    let filteredTasks = [...tasks];
    
    // Apply text search
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.text.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    switch (currentFilter) {
        case 'pending':
            filteredTasks = filteredTasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = filteredTasks.filter(t => t.completed);
            break;
        case 'high':
            filteredTasks = filteredTasks.filter(t => t.priority === 'high');
            break;
    }
    
    // Apply sorting
    switch (currentSort) {
        case 'oldest':
            filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        case 'dueDate':
            filteredTasks.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
        case 'alphabetical':
            filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
            break;
        default: // newest
            filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return filteredTasks;
}

function handleClearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to clear', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveData();
        renderTasks();
        updateStats();
        
        showNotification(`${completedCount} completed task(s) cleared`, 'success');
    }
}

// Rendering Functions
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item glass-effect rounded-xl p-4 ${task.completed ? 'completed' : ''} ${getPriorityClass(task.priority)} animate-slideInUp" 
             data-id="${task.id}">
            <div class="flex items-center space-x-4">
                <input 
                    type="checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask(${task.id})"
                    class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                >
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="task-text font-medium ${task.completed ? 'line-through opacity-60' : ''}">${escapeHtml(task.text)}</span>
                        <span class="category-badge ${getCategoryClass(task.category)} text-xs px-2 py-1 rounded-full text-white font-semibold">
                            ${getCategoryIcon(task.category)} ${task.category}
                        </span>
                    </div>
                    
                    <div class="flex items-center space-x-3 text-sm text-gray-400">
                        <span class="priority-badge ${getPriorityColor(task.priority)}">
                            ${getPriorityIcon(task.priority)} ${task.priority}
                        </span>
                        ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : ''}
                        <span>🕒 ${formatRelativeTime(task.createdAt)}</span>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2">
                    <button 
                        onclick="editTask(${task.id})" 
                        class="p-2 hover:bg-white/20 rounded-lg transition-all duration-300"
                        title="Edit task"
                    >
                        ✏️
                    </button>
                    <button 
                        onclick="deleteTask(${task.id})" 
                        class="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        title="Delete task"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Update clear completed button state
    const completedCount = tasks.filter(t => t.completed).length;
    clearCompleted.disabled = completedCount === 0;
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
    completionRate.textContent = `${rate}%`;
}

// Modal Functions
function showTaskModal(task) {
    modalContent.innerHTML = `
        <form id="editTaskForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Task Description</label>
                <input 
                    type="text" 
                    id="editTaskText" 
                    value="${escapeHtml(task.text)}" 
                    required
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Category</label>
                    <select 
                        id="editTaskCategory"
                        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    >
                        <option value="other" ${task.category === 'other' ? 'selected' : ''}>📋 Other</option>
                        <option value="work" ${task.category === 'work' ? 'selected' : ''}>💼 Work</option>
                        <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>👤 Personal</option>
                        <option value="shopping" ${task.category === 'shopping' ? 'selected' : ''}>🛒 Shopping</option>
                        <option value="health" ${task.category === 'health' ? 'selected' : ''}>🏥 Health</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Priority</label>
                    <select 
                        id="editTaskPriority"
                        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    >
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>🟢 Low Priority</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>🟡 Medium Priority</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>🔴 High Priority</option>
                    </select>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Due Date</label>
                <input 
                    type="date" 
                    id="editTaskDueDate" 
                    value="${task.dueDate || ''}"
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
            </div>
            
            <div class="flex gap-4 pt-4">
                <button 
                    type="submit"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                    💾 Save Changes
                </button>
                <button 
                    type="button"
                    onclick="closeTaskModal()"
                    class="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-all duration-300"
                >
                    ❌ Cancel
                </button>
            </div>
        </form>
    `;
    
    taskModal.classList.remove('hidden');
    taskModal.classList.add('flex');
    
    // Handle form submission
    document.getElementById('editTaskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updates = {
            text: document.getElementById('editTaskText').value.trim(),
            category: document.getElementById('editTaskCategory').value,
            priority: document.getElementById('editTaskPriority').value,
            dueDate: document.getElementById('editTaskDueDate').value || null
        };
        
        if (!updates.text) {
            showNotification('Please enter a task description', 'error');
            return;
        }
        
        updateTask(task.id, updates);
    });
    
    // Focus on text input
    setTimeout(() => {
        document.getElementById('editTaskText').focus();
    }, 100);
}

function closeTaskModal() {
    taskModal.classList.add('hidden');
    taskModal.classList.remove('flex');
}

function showCelebrationModal() {
    if (!settings.notifications) return;
    
    celebrationModal.classList.remove('hidden');
    celebrationModal.classList.add('flex');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        closeCelebrationModal();
    }, 3000);
}

function closeCelebrationModal() {
    celebrationModal.classList.add('hidden');
    celebrationModal.classList.remove('flex');
}

// Utility Functions
function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return '';
    }
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'text-red-400';
        case 'medium': return 'text-yellow-400';
        case 'low': return 'text-green-400';
        default: return 'text-gray-400';
    }
}

function getPriorityIcon(priority) {
    switch (priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '⚪';
    }
}

function getCategoryClass(category) {
    return `category-${category}`;
}

function getCategoryIcon(category) {
    switch (category) {
        case 'work': return '💼';
        case 'personal': return '👤';
        case 'shopping': return '🛒';
        case 'health': return '🏥';
        default: return '📋';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString();
    }
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === taskInput) {
            taskForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeTaskModal();
        closeCelebrationModal();
    }
    
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification glass-effect rounded-lg p-4 mb-2 shadow-lg max-w-sm`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.style.borderLeft = '4px solid #10b981';
            break;
        case 'error':
            notification.style.borderLeft = '4px solid #ef4444';
            break;
        case 'warning':
            notification.style.borderLeft = '4px solid #f59e0b';
            break;
        default:
            notification.style.borderLeft = '4px solid #3b82f6';
    }
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-white">${message}</span>
            <button class="ml-4 text-gray-400 hover:text-white" onclick="this.parentElement.parentElement.remove()">
                ✕
            </button>
        </div>
    `;
    
    notifications.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Sound Effects
function playSound(type) {
    if (!settings.soundEffects) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const sounds = {
        add: { frequency: 800, duration: 0.1 },
        complete: { frequency: 1000, duration: 0.2 },
        delete: { frequency: 400, duration: 0.1 }
    };
    
    const sound = sounds[type];
    if (!sound) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
}

// Data Persistence
function saveData() {
    if (!settings.autoSave) return;
    
    try {
        localStorage.setItem('taskmaster-tasks', JSON.stringify(tasks));
        localStorage.setItem('taskmaster-settings', JSON.stringify(settings));
        localStorage.setItem('taskmaster-nextId', nextId.toString());
    } catch (error) {
        console.error('Failed to save data:', error);
        showNotification('Failed to save data. Storage might be full.', 'error');
    }
}

function loadData() {
    try {
        const savedTasks = localStorage.getItem('taskmaster-tasks');
        const savedSettings = localStorage.getItem('taskmaster-settings');
        const savedNextId = localStorage.getItem('taskmaster-nextId');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        
        if (savedNextId) {
            nextId = parseInt(savedNextId, 10);
        }
        
        // Ensure nextId is always higher than existing task IDs
        if (tasks.length > 0) {
            const maxId = Math.max(...tasks.map(t => t.id));
            nextId = Math.max(nextId, maxId + 1);
        }
        
    } catch (error) {
        console.error('Failed to load data:', error);
        showNotification('Failed to load saved data', 'error');
    }
}

// Utility function for debouncing
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

// Make functions globally available for inline event handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.closeTaskModal = closeTaskModal;
window.closeCelebrationModal = closeCelebrationModal;