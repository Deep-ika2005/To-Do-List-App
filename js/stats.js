// TaskMaster Pro - Statistics Page JavaScript

// Application State
let tasks = [];
let settings = {};

// DOM Elements
const totalTasksCount = document.getElementById('totalTasksCount');
const completedTasksCount = document.getElementById('completedTasksCount');
const pendingTasksCount = document.getElementById('pendingTasksCount');
const completionRateCount = document.getElementById('completionRateCount');

const todayProgress = document.getElementById('todayProgress');
const todayProgressBar = document.getElementById('todayProgressBar');
const weekProgress = document.getElementById('weekProgress');
const weekProgressBar = document.getElementById('weekProgressBar');
const monthProgress = document.getElementById('monthProgress');
const monthProgressBar = document.getElementById('monthProgressBar');

const categoryStats = document.getElementById('categoryStats');
const weeklyChart = document.getElementById('weeklyChart');
const achievements = document.getElementById('achievements');
const productivityTips = document.getElementById('productivityTips');

// Priority elements
const highPriorityBar = document.getElementById('highPriorityBar');
const highPriorityCount = document.getElementById('highPriorityCount');
const mediumPriorityBar = document.getElementById('mediumPriorityBar');
const mediumPriorityCount = document.getElementById('mediumPriorityCount');
const lowPriorityBar = document.getElementById('lowPriorityBar');
const lowPriorityCount = document.getElementById('lowPriorityCount');

// Initialize statistics page
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderAllStats();
    console.log('📊 TaskMaster Pro Statistics Loaded');
});

// Load data from localStorage
function loadData() {
    try {
        const savedTasks = localStorage.getItem('taskmaster-tasks');
        const savedSettings = localStorage.getItem('taskmaster-settings');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
        }
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Render all statistics
function renderAllStats() {
    renderOverviewStats();
    renderProgressStats();
    renderCategoryStats();
    renderPriorityStats();
    renderWeeklyChart();
    renderAchievements();
    renderProductivityTips();
}

// Overview Statistics
function renderOverviewStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Animate counters
    animateCounter(totalTasksCount, total);
    animateCounter(completedTasksCount, completed);
    animateCounter(pendingTasksCount, pending);
    animateCounter(completionRateCount, rate, '%');
    
    // Calculate weekly changes
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const tasksThisWeek = tasks.filter(t => new Date(t.createdAt) > weekAgo).length;
    const completedThisWeek = tasks.filter(t => 
        t.completed && t.completedAt && new Date(t.completedAt) > weekAgo
    ).length;
    
    // Update change indicators
    document.getElementById('totalTasksChange').textContent = `+${tasksThisWeek} this week`;
    document.getElementById('completedTasksChange').textContent = `+${completedThisWeek} this week`;
    document.getElementById('pendingTasksChange').textContent = `${pending - completedThisWeek} remaining`;
    document.getElementById('completionRateChange').textContent = `${rate >= 70 ? '+' : ''}${rate >= 70 ? 'Great!' : 'Keep going!'}`;
}

// Progress Statistics
function renderProgressStats() {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Today's progress
    const todayTasks = tasks.filter(t => new Date(t.createdAt) >= startOfToday);
    const todayCompleted = todayTasks.filter(t => t.completed);
    const todayRate = todayTasks.length > 0 ? (todayCompleted.length / todayTasks.length) * 100 : 0;
    
    todayProgress.textContent = `${todayCompleted.length}/${todayTasks.length}`;
    todayProgressBar.style.width = `${todayRate}%`;
    
    // This week's progress
    const weekTasks = tasks.filter(t => new Date(t.createdAt) >= startOfWeek);
    const weekCompleted = weekTasks.filter(t => t.completed);
    const weekRate = weekTasks.length > 0 ? (weekCompleted.length / weekTasks.length) * 100 : 0;
    
    weekProgress.textContent = `${weekCompleted.length}/${weekTasks.length}`;
    weekProgressBar.style.width = `${weekRate}%`;
    
    // This month's progress
    const monthTasks = tasks.filter(t => new Date(t.createdAt) >= startOfMonth);
    const monthCompleted = monthTasks.filter(t => t.completed);
    const monthRate = monthTasks.length > 0 ? (monthCompleted.length / monthTasks.length) * 100 : 0;
    
    monthProgress.textContent = `${monthCompleted.length}/${monthTasks.length}`;
    monthProgressBar.style.width = `${monthRate}%`;
}

// Category Statistics
function renderCategoryStats() {
    const categories = ['work', 'personal', 'shopping', 'health', 'other'];
    const categoryData = categories.map(category => {
        const categoryTasks = tasks.filter(t => t.category === category);
        const completed = categoryTasks.filter(t => t.completed).length;
        const total = categoryTasks.length;
        const rate = total > 0 ? (completed / total) * 100 : 0;
        
        return {
            name: category,
            icon: getCategoryIcon(category),
            total,
            completed,
            rate
        };
    }).filter(cat => cat.total > 0);
    
    categoryStats.innerHTML = categoryData.map(cat => `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <span class="text-2xl">${cat.icon}</span>
                <div>
                    <div class="font-semibold capitalize">${cat.name}</div>
                    <div class="text-sm text-gray-400">${cat.completed}/${cat.total} completed</div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-700 rounded-full h-2">
                    <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full progress-bar" style="width: ${cat.rate}%"></div>
                </div>
                <span class="text-sm text-gray-300 w-12">${Math.round(cat.rate)}%</span>
            </div>
        </div>
    `).join('');
}

// Priority Statistics
function renderPriorityStats() {
    const priorities = ['high', 'medium', 'low'];
    const priorityData = priorities.map(priority => {
        const priorityTasks = tasks.filter(t => t.priority === priority);
        return {
            name: priority,
            count: priorityTasks.length,
            completed: priorityTasks.filter(t => t.completed).length
        };
    });
    
    const totalTasks = tasks.length;
    
    // High priority
    const highData = priorityData.find(p => p.name === 'high');
    const highPercentage = totalTasks > 0 ? (highData.count / totalTasks) * 100 : 0;
    highPriorityBar.style.width = `${highPercentage}%`;
    highPriorityCount.textContent = highData.count;
    
    // Medium priority
    const mediumData = priorityData.find(p => p.name === 'medium');
    const mediumPercentage = totalTasks > 0 ? (mediumData.count / totalTasks) * 100 : 0;
    mediumPriorityBar.style.width = `${mediumPercentage}%`;
    mediumPriorityCount.textContent = mediumData.count;
    
    // Low priority
    const lowData = priorityData.find(p => p.name === 'low');
    const lowPercentage = totalTasks > 0 ? (lowData.count / totalTasks) * 100 : 0;
    lowPriorityBar.style.width = `${lowPercentage}%`;
    lowPriorityCount.textContent = lowData.count;
}

// Weekly Activity Chart
function renderWeeklyChart() {
    const today = new Date();
    const weekData = [];
    
    // Get data for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        
        const dayTasks = tasks.filter(t => {
            const taskDate = new Date(t.createdAt);
            return taskDate >= startOfDay && taskDate < endOfDay;
        });
        
        const completed = dayTasks.filter(t => t.completed).length;
        
        weekData.push({
            day: date.toLocaleDateString('en', { weekday: 'short' }),
            total: dayTasks.length,
            completed: completed
        });
    }
    
    const maxTasks = Math.max(...weekData.map(d => d.total), 1);
    
    weeklyChart.innerHTML = weekData.map(day => `
        <div class="flex flex-col items-center space-y-1">
            <div class="flex flex-col items-center space-y-1 h-full justify-end">
                ${day.total > 0 ? `
                    <div class="chart-bar bg-gradient-to-t from-purple-600 to-pink-600 w-8 rounded-t-lg transition-all duration-500" 
                         style="height: ${(day.total / maxTasks) * 160}px"
                         title="${day.total} tasks, ${day.completed} completed">
                    </div>
                ` : `
                    <div class="chart-bar bg-gray-600 w-8 rounded-t-lg" style="height: 4px"></div>
                `}
            </div>
            <span class="text-xs text-gray-400">${day.day}</span>
        </div>
    `).join('');
}

// Achievements
function renderAchievements() {
    const achievementsList = [
        {
            id: 'first_task',
            title: 'Getting Started',
            description: 'Created your first task',
            icon: '🎯',
            unlocked: tasks.length > 0
        },
        {
            id: 'task_master',
            title: 'Task Master',
            description: 'Completed 10 tasks',
            icon: '🏆',
            unlocked: tasks.filter(t => t.completed).length >= 10
        },
        {
            id: 'productive_day',
            title: 'Productive Day',
            description: 'Completed 5 tasks in one day',
            icon: '⚡',
            unlocked: checkProductiveDay()
        },
        {
            id: 'week_warrior',
            title: 'Week Warrior',
            description: 'Completed tasks 7 days in a row',
            icon: '🔥',
            unlocked: checkWeekStreak()
        },
        {
            id: 'priority_pro',
            title: 'Priority Pro',
            description: 'Completed all high priority tasks',
            icon: '🎖️',
            unlocked: checkPriorityPro()
        },
        {
            id: 'category_king',
            title: 'Category King',
            description: 'Used all task categories',
            icon: '👑',
            unlocked: checkCategoryKing()
        },
        {
            id: 'century_club',
            title: 'Century Club',
            description: 'Completed 100 tasks',
            icon: '💯',
            unlocked: tasks.filter(t => t.completed).length >= 100
        },
        {
            id: 'perfectionist',
            title: 'Perfectionist',
            description: '100% completion rate',
            icon: '✨',
            unlocked: tasks.length > 0 && tasks.every(t => t.completed)
        }
    ];
    
    achievements.innerHTML = achievementsList.map(achievement => `
        <div class="text-center p-4 rounded-xl ${achievement.unlocked ? 'glass-effect' : 'bg-gray-800/50'} transition-all duration-300">
            <div class="text-3xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}">${achievement.icon}</div>
            <h4 class="font-semibold text-sm mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}">${achievement.title}</h4>
            <p class="text-xs ${achievement.unlocked ? 'text-gray-300' : 'text-gray-600'}">${achievement.description}</p>
            ${achievement.unlocked ? '<div class="text-xs text-green-400 mt-1">✓ Unlocked</div>' : '<div class="text-xs text-gray-500 mt-1">🔒 Locked</div>'}
        </div>
    `).join('');
}

// Productivity Tips
function renderProductivityTips() {
    const tips = [
        {
            title: 'Time Blocking',
            description: 'Allocate specific time slots for different types of tasks to improve focus and productivity.',
            icon: '⏰'
        },
        {
            title: 'Priority Matrix',
            description: 'Use the Eisenhower Matrix: Important & Urgent, Important & Not Urgent, etc.',
            icon: '📊'
        },
        {
            title: 'Break Large Tasks',
            description: 'Divide big projects into smaller, manageable subtasks for better progress tracking.',
            icon: '🧩'
        },
        {
            title: 'Regular Reviews',
            description: 'Review your task list daily and weekly to stay on track with your goals.',
            icon: '🔍'
        }
    ];
    
    // Add personalized tips based on user data
    const personalizedTips = generatePersonalizedTips();
    const allTips = [...personalizedTips, ...tips];
    
    productivityTips.innerHTML = allTips.slice(0, 4).map(tip => `
        <div class="glass-effect rounded-xl p-6">
            <div class="flex items-start space-x-4">
                <div class="text-3xl">${tip.icon}</div>
                <div>
                    <h4 class="font-semibold mb-2">${tip.title}</h4>
                    <p class="text-gray-300 text-sm">${tip.description}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper Functions
function animateCounter(element, target, suffix = '') {
    const duration = 1000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
        }
    };
    
    updateCounter();
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

function checkProductiveDay() {
    const tasksByDay = {};
    
    tasks.filter(t => t.completed && t.completedAt).forEach(task => {
        const date = new Date(task.completedAt).toDateString();
        tasksByDay[date] = (tasksByDay[date] || 0) + 1;
    });
    
    return Object.values(tasksByDay).some(count => count >= 5);
}

function checkWeekStreak() {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        const hasCompletedTask = tasks.some(task => 
            task.completed && 
            task.completedAt && 
            new Date(task.completedAt).toDateString() === dateString
        );
        
        if (hasCompletedTask) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak >= 7;
}

function checkPriorityPro() {
    const highPriorityTasks = tasks.filter(t => t.priority === 'high');
    return highPriorityTasks.length > 0 && highPriorityTasks.every(t => t.completed);
}

function checkCategoryKing() {
    const categories = ['work', 'personal', 'shopping', 'health', 'other'];
    const usedCategories = new Set(tasks.map(t => t.category));
    return categories.every(cat => usedCategories.has(cat));
}

function generatePersonalizedTips() {
    const tips = [];
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    
    // Tip based on completion rate
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    if (completionRate < 50) {
        tips.push({
            title: 'Focus on Completion',
            description: 'You have many pending tasks. Try focusing on completing existing tasks before adding new ones.',
            icon: '🎯'
        });
    }
    
    // Tip based on overdue tasks
    const overdueTasks = pendingTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
    });
    
    if (overdueTasks.length > 0) {
        tips.push({
            title: 'Handle Overdue Tasks',
            description: `You have ${overdueTasks.length} overdue task(s). Consider prioritizing these to stay on track.`,
            icon: '⚠️'
        });
    }
    
    // Tip based on high priority tasks
    const highPriorityPending = pendingTasks.filter(t => t.priority === 'high');
    
    if (highPriorityPending.length > 0) {
        tips.push({
            title: 'High Priority Focus',
            description: `You have ${highPriorityPending.length} high priority task(s) pending. Consider tackling these first.`,
            icon: '🔴'
        });
    }
    
    return tips;
}