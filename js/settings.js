// TaskMaster Pro - Settings Page JavaScript

// Application State
let settings = {
    darkMode: true,
    soundEffects: true,
    animations: true,
    autoSave: true,
    reminders: true,
    dailySummary: false,
    achievements: true,
    defaultPriority: 'medium',
    defaultCategory: 'other',
    autoComplete: true,
    confirmDelete: true
};

let tasks = [];

// DOM Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const soundToggle = document.getElementById('soundToggle');
const animationsToggle = document.getElementById('animationsToggle');
const autoSaveToggle = document.getElementById('autoSaveToggle');
const remindersToggle = document.getElementById('remindersToggle');
const dailySummaryToggle = document.getElementById('dailySummaryToggle');
const achievementToggle = document.getElementById('achievementToggle');
const defaultPriority = document.getElementById('defaultPriority');
const defaultCategory = document.getElementById('defaultCategory');
const autoCompleteToggle = document.getElementById('autoCompleteToggle');
const confirmDeleteToggle = document.getElementById('confirmDeleteToggle');

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearDataBtn = document.getElementById('clearDataBtn');

const storageUsed = document.getElementById('storageUsed');
const totalTasksCreated = document.getElementById('totalTasksCreated');

const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmOk = document.getElementById('confirmOk');
const confirmCancel = document.getElementById('confirmCancel');

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateUI();
    updateStorageInfo();
    console.log('⚙️ TaskMaster Pro Settings Loaded');
});

// Load data from localStorage
function loadData() {
    try {
        const savedSettings = localStorage.getItem('taskmaster-settings');
        const savedTasks = localStorage.getItem('taskmaster-tasks');
        
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        showNotification('Failed to load settings', 'error');
    }
}

// Save settings to localStorage
function saveSettings() {
    try {
        localStorage.setItem('taskmaster-settings', JSON.stringify(settings));
        showNotification('Settings saved successfully', 'success');
    } catch (error) {
        console.error('Failed to save settings:', error);
        showNotification('Failed to save settings', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Toggle switches
    darkModeToggle.addEventListener('change', () => {
        settings.darkMode = darkModeToggle.checked;
        saveSettings();
        applyTheme();
    });
    
    soundToggle.addEventListener('change', () => {
        settings.soundEffects = soundToggle.checked;
        saveSettings();
        if (settings.soundEffects) {
            playTestSound();
        }
    });
    
    animationsToggle.addEventListener('change', () => {
        settings.animations = animationsToggle.checked;
        saveSettings();
        applyAnimations();
    });
    
    autoSaveToggle.addEventListener('change', () => {
        settings.autoSave = autoSaveToggle.checked;
        saveSettings();
    });
    
    remindersToggle.addEventListener('change', () => {
        settings.reminders = remindersToggle.checked;
        saveSettings();
    });
    
    dailySummaryToggle.addEventListener('change', () => {
        settings.dailySummary = dailySummaryToggle.checked;
        saveSettings();
    });
    
    achievementToggle.addEventListener('change', () => {
        settings.achievements = achievementToggle.checked;
        saveSettings();
    });
    
    // Select dropdowns
    defaultPriority.addEventListener('change', () => {
        settings.defaultPriority = defaultPriority.value;
        saveSettings();
    });
    
    defaultCategory.addEventListener('change', () => {
        settings.defaultCategory = defaultCategory.value;
        saveSettings();
    });
    
    autoCompleteToggle.addEventListener('change', () => {
        settings.autoComplete = autoCompleteToggle.checked;
        saveSettings();
    });
    
    confirmDeleteToggle.addEventListener('change', () => {
        settings.confirmDelete = confirmDeleteToggle.checked;
        saveSettings();
    });
    
    // Data management buttons
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importData);
    clearDataBtn.addEventListener('click', () => showConfirmModal('clear'));
    
    // Modal controls
    confirmCancel.addEventListener('click', hideConfirmModal);
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) hideConfirmModal();
    });
}

// Update UI with current settings
function updateUI() {
    darkModeToggle.checked = settings.darkMode;
    soundToggle.checked = settings.soundEffects;
    animationsToggle.checked = settings.animations;
    autoSaveToggle.checked = settings.autoSave;
    remindersToggle.checked = settings.reminders;
    dailySummaryToggle.checked = settings.dailySummary;
    achievementToggle.checked = settings.achievements;
    defaultPriority.value = settings.defaultPriority;
    defaultCategory.value = settings.defaultCategory;
    autoCompleteToggle.checked = settings.autoComplete;
    confirmDeleteToggle.checked = settings.confirmDelete;
    
    applyTheme();
    applyAnimations();
}

// Apply theme settings
function applyTheme() {
    if (settings.darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Apply animation settings
function applyAnimations() {
    if (settings.animations) {
        document.body.classList.remove('no-animations');
    } else {
        document.body.classList.add('no-animations');
    }
}

// Data Management Functions
function exportData() {
    try {
        const exportData = {
            tasks: tasks,
            settings: settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `taskmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Data exported successfully! 📥', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Failed to export data', 'error');
    }
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate imported data
            if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
                throw new Error('Invalid data format');
            }
            
            // Confirm import
            showConfirmModal('import', importedData);
            
        } catch (error) {
            console.error('Import failed:', error);
            showNotification('Invalid file format. Please select a valid TaskMaster backup file.', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

function performImport(importedData) {
    try {
        // Backup current data
        const backup = {
            tasks: tasks,
            settings: settings
        };
        localStorage.setItem('taskmaster-backup', JSON.stringify(backup));
        
        // Import new data
        tasks = importedData.tasks;
        if (importedData.settings) {
            settings = { ...settings, ...importedData.settings };
        }
        
        // Save imported data
        localStorage.setItem('taskmaster-tasks', JSON.stringify(tasks));
        localStorage.setItem('taskmaster-settings', JSON.stringify(settings));
        
        // Update UI
        updateUI();
        updateStorageInfo();
        
        showNotification(`Successfully imported ${tasks.length} tasks! 📤`, 'success');
        
    } catch (error) {
        console.error('Import failed:', error);
        showNotification('Failed to import data', 'error');
    }
}

function clearAllData() {
    try {
        // Create backup before clearing
        const backup = {
            tasks: tasks,
            settings: settings,
            clearedAt: new Date().toISOString()
        };
        localStorage.setItem('taskmaster-last-backup', JSON.stringify(backup));
        
        // Clear all data
        localStorage.removeItem('taskmaster-tasks');
        localStorage.removeItem('taskmaster-settings');
        localStorage.removeItem('taskmaster-nextId');
        
        // Reset application state
        tasks = [];
        settings = {
            darkMode: true,
            soundEffects: true,
            animations: true,
            autoSave: true,
            reminders: true,
            dailySummary: false,
            achievements: true,
            defaultPriority: 'medium',
            defaultCategory: 'other',
            autoComplete: true,
            confirmDelete: true
        };
        
        // Update UI
        updateUI();
        updateStorageInfo();
        
        showNotification('All data cleared successfully. A backup has been saved.', 'success');
        
    } catch (error) {
        console.error('Clear data failed:', error);
        showNotification('Failed to clear data', 'error');
    }
}

// Storage Information
function updateStorageInfo() {
    try {
        // Calculate storage usage
        const tasksSize = new Blob([localStorage.getItem('taskmaster-tasks') || '']).size;
        const settingsSize = new Blob([localStorage.getItem('taskmaster-settings') || '']).size;
        const totalSize = tasksSize + settingsSize;
        
        // Format size
        let sizeText;
        if (totalSize < 1024) {
            sizeText = `${totalSize} B`;
        } else if (totalSize < 1024 * 1024) {
            sizeText = `${(totalSize / 1024).toFixed(1)} KB`;
        } else {
            sizeText = `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
        }
        
        storageUsed.textContent = sizeText;
        totalTasksCreated.textContent = tasks.length;
        
    } catch (error) {
        console.error('Failed to calculate storage:', error);
        storageUsed.textContent = 'Unknown';
        totalTasksCreated.textContent = '0';
    }
}

// Modal Functions
function showConfirmModal(action, data = null) {
    let message = '';
    let confirmAction = null;
    
    switch (action) {
        case 'clear':
            message = 'Are you sure you want to clear all data? This action cannot be undone. A backup will be created automatically.';
            confirmAction = clearAllData;
            break;
        case 'import':
            message = `Are you sure you want to import ${data.tasks.length} tasks? This will replace your current data. A backup will be created automatically.`;
            confirmAction = () => performImport(data);
            break;
    }
    
    confirmMessage.textContent = message;
    confirmModal.classList.remove('hidden');
    confirmModal.classList.add('flex');
    
    // Set up confirm button
    confirmOk.onclick = () => {
        hideConfirmModal();
        if (confirmAction) confirmAction();
    };
}

function hideConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmModal.classList.remove('flex');
}

// Sound Effects
function playTestSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.error('Sound test failed:', error);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            notification.style.color = 'white';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            notification.style.color = 'white';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            notification.style.color = 'white';
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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes modal
    if (e.key === 'Escape') {
        hideConfirmModal();
    }
    
    // Ctrl/Cmd + S to save settings (already auto-saved, but show confirmation)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showNotification('Settings are automatically saved! ✅', 'success');
    }
});

// Auto-save settings when page is about to unload
window.addEventListener('beforeunload', () => {
    if (settings.autoSave) {
        saveSettings();
    }
});