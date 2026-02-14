// Whoop API Integration

// Configuration for Whoop OAuth
const whoopConfig = {
    clientId: '501d371f-6939-4b75-b9db-57069c551cfb',
    redirectUri: window.location.origin + '/training-dashboard/whoop-callback.html',
    apiEndpoint: 'https://api.whoop.com/v2',
    scopes: 'read:recovery read:sleep read:workout read:profile'
};

// Initialize Whoop API
function initWhoopApi() {
    // Add connect button event listener
    const connectBtn = document.getElementById('connect-whoop-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectToWhoop);
    }
    
    // Check if already connected
    checkWhoopConnection();
}

// Connect to Whoop
function connectToWhoop() {
    const authUrl = `https://api.whoop.com/oauth/authorize?response_type=code&client_id=${whoopConfig.clientId}&redirect_uri=${encodeURIComponent(whoopConfig.redirectUri)}&scope=${encodeURIComponent(whoopConfig.scopes)}`;
    
    // Open popup window for authorization
    window.open(authUrl, 'Whoop Authorization', 'width=600,height=700');
}

// Check if already connected to Whoop
function checkWhoopConnection() {
    const token = localStorage.getItem('whoopAccessToken');
    const expires = localStorage.getItem('whoopTokenExpires');
    
    const isConnected = token && expires && Date.now() < parseInt(expires);
    
    // Update UI based on connection status
    updateWhoopConnectionUI(isConnected);
    
    // If connected, fetch data
    if (isConnected) {
        fetchWhoopData();
    }
    
    return isConnected;
}

// Update UI based on Whoop connection status
function updateWhoopConnectionUI(isConnected) {
    const connectBtn = document.getElementById('connect-whoop-btn');
    const statusElement = document.getElementById('whoop-connection-status');
    const dataSection = document.getElementById('whoop-data-section');
    
    if (connectBtn) {
        connectBtn.textContent = isConnected ? 'Reconnect to Whoop' : 'Connect to Whoop';
    }
    
    if (statusElement) {
        statusElement.textContent = isConnected ? 'Connected' : 'Not Connected';
        statusElement.className = isConnected ? 'status-connected' : 'status-disconnected';
    }
    
    if (dataSection) {
        dataSection.style.display = isConnected ? 'block' : 'none';
    }
}

// Fetch Whoop data (recovery, sleep, workouts)
async function fetchWhoopData() {
    try {
        // Show loading indicator
        showLoadingIndicator(true);
        
        // In a real implementation, these would be actual API calls
        const recoveryData = await fetchWhoopRecovery();
        const sleepData = await fetchWhoopSleep();
        const workoutData = await fetchWhoopWorkouts();
        
        // Process and display the data
        displayWhoopData(recoveryData, sleepData, workoutData);
        
        // Hide loading indicator
        showLoadingIndicator(false);
        
        return {
            recovery: recoveryData,
            sleep: sleepData,
            workouts: workoutData
        };
    } catch (error) {
        console.error('Error fetching Whoop data:', error);
        showWhoopError('Failed to fetch Whoop data. Please try reconnecting.');
        showLoadingIndicator(false);
    }
}

// Show/hide loading indicator
function showLoadingIndicator(show) {
    const loader = document.getElementById('whoop-data-loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// Show error message
function showWhoopError(message) {
    const errorElement = document.getElementById('whoop-error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Mock functions for demo - these would be real API calls in production
async function fetchWhoopRecovery() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock recovery data
    return {
        recovery_score: 85,
        resting_heart_rate: 52,
        hrv: 98,
        date: new Date().toISOString().split('T')[0]
    };
}

async function fetchWhoopSleep() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock sleep data
    return {
        sleep_score: 78,
        sleep_duration: 7.5,
        deep_sleep: 1.8,
        rem_sleep: 2.3,
        light_sleep: 3.4,
        date: new Date().toISOString().split('T')[0]
    };
}

async function fetchWhoopWorkouts() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Return mock workout data
    return [
        {
            type: "Resistance Training",
            duration: 65,
            strain: 12.8,
            average_heart_rate: 132,
            max_heart_rate: 158,
            calories: 450,
            date: new Date().toISOString().split('T')[0]
        }
    ];
}

// Display Whoop data in the UI
function displayWhoopData(recovery, sleep, workouts) {
    // Recovery data
    const recoveryScore = document.getElementById('recovery-score');
    const restingHR = document.getElementById('resting-heart-rate');
    const hrvValue = document.getElementById('hrv-value');
    
    if (recoveryScore) recoveryScore.textContent = recovery.recovery_score + '%';
    if (restingHR) restingHR.textContent = recovery.resting_heart_rate + ' bpm';
    if (hrvValue) hrvValue.textContent = recovery.hrv + ' ms';
    
    // Update recovery color
    updateRecoveryColor(recovery.recovery_score);
    
    // Sleep data
    const sleepScore = document.getElementById('sleep-score');
    const sleepDuration = document.getElementById('sleep-duration');
    
    if (sleepScore) sleepScore.textContent = sleep.sleep_score + '%';
    if (sleepDuration) sleepDuration.textContent = sleep.sleep_duration + ' hours';
    
    // Adjust training recommendation based on recovery
    adjustTrainingRecommendation(recovery.recovery_score);
}

// Update recovery color based on score
function updateRecoveryColor(score) {
    const recoveryElement = document.getElementById('recovery-indicator');
    if (!recoveryElement) return;
    
    let color = '#4CAF50'; // Green (good recovery)
    if (score < 33) {
        color = '#F44336'; // Red (poor recovery)
    } else if (score < 66) {
        color = '#FFC107'; // Yellow (moderate recovery)
    }
    
    recoveryElement.style.backgroundColor = color;
}

// Adjust training recommendation based on recovery
function adjustTrainingRecommendation(recoveryScore) {
    const recommendationElement = document.getElementById('training-recommendation');
    if (!recommendationElement) return;
    
    let recommendation = '';
    let intensity = '';
    
    if (recoveryScore < 33) {
        recommendation = 'Heute nur leichtes Training oder aktive Erholung';
        intensity = 'Low: Reduziere Volumen & Intensität um 30-50%';
    } else if (recoveryScore < 66) {
        recommendation = 'Moderates Training - halte dich an den Plan, aber höre auf deinen Körper';
        intensity = 'Medium: Standard-Trainingsplan folgen';
    } else {
        recommendation = 'Optimale Erholung - heute ist ein guter Tag für intensives Training';
        intensity = 'High: Du kannst heute 110% geben und die Intensität steigern';
    }
    
    recommendationElement.textContent = recommendation;
    
    const intensityElement = document.getElementById('recommended-intensity');
    if (intensityElement) {
        intensityElement.textContent = intensity;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initWhoopApi);