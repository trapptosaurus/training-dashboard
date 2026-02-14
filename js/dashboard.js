// Dashboard.js - Handles data loading and visualization for the Training Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    fetch('data/user_data.json')
        .then(response => response.json())
        .then(data => {
            initializeDashboard(data);
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            document.getElementById('main-content').innerHTML = 
                '<div class="card"><h2>Error Loading Data</h2><p>Could not load user data. Please try again later.</p></div>';
        });
});

function initializeDashboard(data) {
    // Update user stats
    updateUserStats(data.user);
    
    // Update timeline and phases
    updateTimeline(data.timeline);
    
    // Update performance metrics
    updatePerformanceMetrics(data.performance, data.proportions);
    
    // Update next workout
    updateNextWorkout(data.next_workout);
    
    // Update recovery data
    updateRecoveryData(data.recovery);
    
    // Update cycle plan
    updateCyclePlan(data.cycle_plan);
    
    // Update important dates
    updateImportantDates(data.important_dates);
    
    // Update PR targets
    updatePRTargets(data.performance.pr_targets);
    
    // Animate progress bars
    setTimeout(animateProgressBars, 100);
}

function updateUserStats(user) {
    document.getElementById('current-weight').textContent = user.weight + ' kg';
    document.getElementById('target-weight').textContent = user.target_weight + ' kg';
}

function updateTimeline(timeline) {
    const timelineContainer = document.getElementById('timeline-container');
    
    // Clear existing content
    timelineContainer.innerHTML = '';
    
    // Find current phase
    const currentDate = new Date();
    let currentPhaseIndex = 0;
    
    timeline.forEach((phase, index) => {
        const startDate = new Date(phase.timeframe.start);
        const endDate = new Date(phase.timeframe.end);
        
        if (currentDate >= startDate && currentDate <= endDate) {
            currentPhaseIndex = index;
        }
        
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const isCurrentPhase = index === currentPhaseIndex;
        const isPastPhase = index < currentPhaseIndex;
        const isFuturePhase = index > currentPhaseIndex;
        
        timelineItem.innerHTML = `
            <div class="timeline-marker ${isCurrentPhase ? 'current' : isFuturePhase ? 'future' : ''}"></div>
            <div class="timeline-content phase-${phase.phase.toLowerCase().replace(/\s+/g, '')}">
                <h4>${phase.phase} (${phase.timeframe.start} - ${phase.timeframe.end})</h4>
                <p><strong>Strategie:</strong> ${phase.strategy}</p>
                <p><strong>Fokus:</strong> ${phase.focus}</p>
                <p><strong>Recovery:</strong> ${phase.recovery}</p>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
    
    // Update progress bar
    updateCycleProgress(timeline);
}

function updateCycleProgress(timeline) {
    const cycleStartDate = new Date(timeline[3].timeframe.start); // Blast-Start
    const cycleEndDate = new Date(timeline[4].timeframe.end);     // Peak-Blast End
    const currentDate = new Date();
    
    let progressPercentage = 0;
    
    if (currentDate > cycleStartDate) {
        const totalDuration = cycleEndDate - cycleStartDate;
        const elapsedDuration = currentDate - cycleStartDate;
        progressPercentage = Math.min(100, Math.round((elapsedDuration / totalDuration) * 100));
    }
    
    const progressBar = document.getElementById('cycle-progress-bar');
    const progressLabel = document.getElementById('cycle-progress-label');
    
    progressBar.style.width = progressPercentage + '%';
    progressLabel.textContent = progressPercentage + '%';
}

function updatePerformanceMetrics(performance, proportions) {
    // Update exercise progress
    const exerciseContainer = document.getElementById('exercise-progress');
    exerciseContainer.innerHTML = '';
    
    for (const [exercise, current] of Object.entries(performance.current)) {
        const target = performance.targets[exercise];
        const exerciseName = formatExerciseName(exercise);
        
        const muscleItem = document.createElement('div');
        muscleItem.className = 'muscle-item';
        muscleItem.innerHTML = `
            <div class="muscle-name">${exerciseName}</div>
            <div class="muscle-stats">
                <span class="current">${current}</span>
                <span class="target">${target}</span>
            </div>
            <div class="mini-progress">
                <div class="mini-progress-bar" style="width: 65%;"></div>
            </div>
        `;
        
        exerciseContainer.appendChild(muscleItem);
    }
    
    // Update proportions
    const proportionsContainer = document.getElementById('proportions-progress');
    proportionsContainer.innerHTML = '';
    
    for (const [muscle, data] of Object.entries(proportions)) {
        const muscleName = formatMuscleName(muscle);
        
        const muscleItem = document.createElement('div');
        muscleItem.className = 'muscle-item';
        muscleItem.innerHTML = `
            <div class="muscle-name">${muscleName}</div>
            <div class="muscle-stats">
                <span class="current">${data.current}</span>
                <span class="target">${data.target}</span>
            </div>
            <div class="mini-progress">
                <div class="mini-progress-bar" style="width: ${data.progress}%;"></div>
            </div>
        `;
        
        proportionsContainer.appendChild(muscleItem);
    }
}

function updateNextWorkout(workout) {
    document.getElementById('next-workout-day').textContent = workout.day;
    document.getElementById('next-workout-date').textContent = workout.date;
    document.getElementById('next-workout-focus').textContent = workout.focus;
    
    const prAttemptsContainer = document.getElementById('pr-attempts');
    prAttemptsContainer.innerHTML = '';
    
    workout.pr_attempts.forEach(attempt => {
        const li = document.createElement('li');
        li.textContent = `${attempt.exercise}: ${attempt.sets}@${attempt.weight}`;
        prAttemptsContainer.appendChild(li);
    });
}

function updateRecoveryData(recovery) {
    document.getElementById('recovery-percentage').textContent = recovery.current + '%';
    document.getElementById('recovery-trend').textContent = recovery.trend;
    document.getElementById('rhr-value').textContent = recovery.rhr.value + ' bpm';
    document.getElementById('rhr-trend').textContent = recovery.rhr.trend;
    document.getElementById('hrv-value').textContent = recovery.hrv.value + ' ms';
    document.getElementById('hrv-trend').textContent = recovery.hrv.trend;
    
    // Update recovery chart
    const recoveryChart = document.getElementById('recovery-chart');
    recoveryChart.innerHTML = '';
    
    recovery.weekly_data.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'recovery-bar';
        bar.style.height = value + '%';
        bar.style.left = (10 + index * 15) + 'px';
        
        // Color code based on recovery level
        if (value >= 80) {
            bar.style.backgroundColor = '#27ae60'; // Green for high recovery
        } else if (value < 50) {
            bar.style.backgroundColor = '#e67e22'; // Orange for low recovery
        }
        
        recoveryChart.appendChild(bar);
    });
}

function updateCyclePlan(cycle) {
    document.getElementById('cycle-status').textContent = cycle.status;
    document.getElementById('cycle-start-date').textContent = cycle.start;
    document.getElementById('cycle-duration').textContent = cycle.duration_weeks + ' Wochen';
    document.getElementById('bloodtest-window').textContent = `${cycle.bloodtest.start} - ${cycle.bloodtest.end}`;
    
    // Update injection schedule
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        const dayBox = document.getElementById(`day-${day}`);
        if (dayBox) {
            if (cycle.injection_schedule[day]) {
                dayBox.classList.add('active-day');
                dayBox.textContent = cycle.injection_schedule[day].join('\n');
            } else {
                dayBox.classList.remove('active-day');
                dayBox.textContent = day.charAt(0).toUpperCase() + day.slice(1, 3);
            }
        }
    });
}

function updateImportantDates(dates) {
    // Update calendar
    const today = new Date();
    const todayDate = today.getDate();
    
    const calendarDays = document.querySelectorAll('.calendar-day:not(:nth-child(-n+7))');
    calendarDays.forEach((day, index) => {
        if (day.textContent.trim() === todayDate.toString()) {
            day.classList.add('today');
        }
        
        // Mark event days
        dates.forEach(dateItem => {
            const eventDate = new Date(dateItem.date);
            if (eventDate.getDate() === parseInt(day.textContent) && 
                eventDate.getMonth() === today.getMonth()) {
                day.classList.add('event');
            }
        });
    });
    
    // Update event list
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';
    
    dates.forEach(dateItem => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${dateItem.date}:</strong> ${dateItem.event}`;
        eventList.appendChild(p);
    });
}

function updatePRTargets(targets) {
    const targetList = document.getElementById('target-list');
    targetList.innerHTML = '';
    
    for (const [exercise, target] of Object.entries(targets)) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="target-exercise">${formatExerciseName(exercise)}</span>
            <span class="target-value">${target}</span>
        `;
        targetList.appendChild(li);
    }
}

function animateProgressBars() {
    document.getElementById('cycle-progress-bar').style.width = 
        document.getElementById('cycle-progress-label').textContent;
    
    const miniProgressBars = document.querySelectorAll('.mini-progress-bar');
    miniProgressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 50);
    });
}

// Utility Functions
function formatExerciseName(camelCase) {
    return camelCase
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatMuscleName(muscle) {
    return muscle
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}