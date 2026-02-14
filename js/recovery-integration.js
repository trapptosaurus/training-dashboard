// Recovery Integration for Training Dashboard
// This module connects Whoop data with training recommendations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Whoop connection
    initializeWhoopConnection();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize the Whoop connection
 * Attempts to connect with existing credentials or shows connect button
 */
async function initializeWhoopConnection() {
    try {
        const isConnected = await whoopAPI.initialize();
        updateConnectionStatus(isConnected);
        
        if (isConnected) {
            // If we're connected, sync the latest data
            await syncWhoopData();
            updateDashboardWithWhoopData();
        }
    } catch (error) {
        console.error('Error initializing Whoop connection:', error);
        updateConnectionStatus(false);
    }
}

/**
 * Update the Whoop connection status display
 * @param {boolean} isConnected - Whether we're connected to Whoop
 */
function updateConnectionStatus(isConnected) {
    const connectButton = document.getElementById('whoop-connect-button');
    const statusDisplay = document.getElementById('whoop-status');
    
    if (isConnected) {
        if (connectButton) connectButton.style.display = 'none';
        if (statusDisplay) {
            statusDisplay.innerHTML = `
                <div class="connected-status">
                    <span class="status-indicator connected"></span>
                    <span>Connected to Whoop</span>
                    <button id="whoop-sync-button" class="sync-button">Sync Now</button>
                    <button id="whoop-disconnect-button" class="disconnect-button">Disconnect</button>
                </div>
            `;
            
            // Add event listeners to the new buttons
            document.getElementById('whoop-sync-button').addEventListener('click', syncWhoopData);
            document.getElementById('whoop-disconnect-button').addEventListener('click', disconnectWhoop);
        }
    } else {
        if (connectButton) {
            connectButton.style.display = 'block';
            connectButton.addEventListener('click', startWhoopAuth);
        }
        if (statusDisplay) {
            statusDisplay.innerHTML = `
                <div class="disconnected-status">
                    <span class="status-indicator disconnected"></span>
                    <span>Not connected to Whoop</span>
                </div>
            `;
        }
    }
}

/**
 * Start the Whoop authentication process
 */
function startWhoopAuth() {
    whoopAPI.startAuthentication();
}

/**
 * Disconnect from Whoop
 */
function disconnectWhoop() {
    whoopAPI.logout();
    updateConnectionStatus(false);
    alert('Disconnected from Whoop');
    
    // Remove Whoop data from dashboard
    const recoveryChart = document.getElementById('recovery-chart');
    if (recoveryChart) recoveryChart.innerHTML = '';
    
    const recoveryPercentage = document.getElementById('recovery-percentage');
    if (recoveryPercentage) recoveryPercentage.textContent = 'N/A';
    
    const recoveryTrend = document.getElementById('recovery-trend');
    if (recoveryTrend) {
        recoveryTrend.textContent = 'N/A';
        recoveryTrend.className = '';
    }
    
    const rhrValue = document.getElementById('rhr-value');
    if (rhrValue) rhrValue.textContent = 'N/A';
    
    const rhrTrend = document.getElementById('rhr-trend');
    if (rhrTrend) {
        rhrTrend.textContent = 'N/A';
        rhrTrend.className = '';
    }
    
    const hrvValue = document.getElementById('hrv-value');
    if (hrvValue) hrvValue.textContent = 'N/A';
    
    const hrvTrend = document.getElementById('hrv-trend');
    if (hrvTrend) {
        hrvTrend.textContent = 'N/A';
        hrvTrend.className = '';
    }
    
    // Update recommendation
    const recoveryRecommendation = document.getElementById('recovery-recommendation');
    if (recoveryRecommendation) {
        recoveryRecommendation.textContent = 'Connect your Whoop for personalized training recommendations.';
    }
}

/**
 * Sync the latest data from Whoop
 */
async function syncWhoopData() {
    const syncButton = document.getElementById('whoop-sync-button');
    if (syncButton) {
        syncButton.disabled = true;
        syncButton.textContent = 'Syncing...';
    }
    
    try {
        await whoopAPI.syncWhoopData();
        updateDashboardWithWhoopData();
        
        if (syncButton) {
            syncButton.textContent = 'Synced!';
            setTimeout(() => {
                syncButton.disabled = false;
                syncButton.textContent = 'Sync Now';
            }, 2000);
        }
    } catch (error) {
        console.error('Error syncing Whoop data:', error);
        if (syncButton) {
            syncButton.disabled = false;
            syncButton.textContent = 'Sync Failed';
            setTimeout(() => {
                syncButton.textContent = 'Sync Now';
            }, 2000);
        }
        alert('Failed to sync Whoop data. Please try again later.');
    }
}

/**
 * Update the dashboard with Whoop data
 */
function updateDashboardWithWhoopData() {
    // Get the latest recovery data
    const lastRecovery = whoopAPI.getLatestRecoveryScore();
    const recoveryData = whoopAPI.getLast7DaysRecovery();
    
    // Update recovery percentage
    const recoveryPercentage = document.getElementById('recovery-percentage');
    if (recoveryPercentage && lastRecovery) {
        recoveryPercentage.textContent = `${Math.round(lastRecovery.score)}%`;
    }
    
    // Update recovery trend
    const recoveryTrend = document.getElementById('recovery-trend');
    if (recoveryTrend && lastRecovery && recoveryData.length > 1) {
        const prevRecovery = recoveryData[recoveryData.length - 2];
        if (prevRecovery) {
            const change = lastRecovery.score - prevRecovery.score;
            const formattedChange = change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
            
            recoveryTrend.textContent = formattedChange;
            if (change > 0) {
                recoveryTrend.className = 'value-up';
            } else if (change < 0) {
                recoveryTrend.className = 'value-down';
            } else {
                recoveryTrend.className = 'value-same';
            }
        }
    }
    
    // Update RHR
    const rhrValue = document.getElementById('rhr-value');
    const rhrTrend = document.getElementById('rhr-trend');
    if (rhrValue && rhrTrend && lastRecovery && recoveryData.length > 1) {
        rhrValue.textContent = `${lastRecovery.resting_heart_rate} bpm`;
        
        const prevRhr = recoveryData[recoveryData.length - 2].resting_heart_rate;
        const rhrChange = lastRecovery.resting_heart_rate - prevRhr;
        const formattedRhrChange = rhrChange > 0 ? `+${rhrChange} bpm` : `${rhrChange} bpm`;
        
        rhrTrend.textContent = formattedRhrChange;
        // For RHR, lower is usually better
        if (rhrChange < 0) {
            rhrTrend.className = 'value-up';
        } else if (rhrChange > 0) {
            rhrTrend.className = 'value-down';
        } else {
            rhrTrend.className = 'value-same';
        }
    }
    
    // Update HRV
    const hrvValue = document.getElementById('hrv-value');
    const hrvTrend = document.getElementById('hrv-trend');
    if (hrvValue && hrvTrend && lastRecovery && recoveryData.length > 1) {
        hrvValue.textContent = `${Math.round(lastRecovery.hrv)} ms`;
        
        const prevHrv = recoveryData[recoveryData.length - 2].hrv;
        const hrvChange = lastRecovery.hrv - prevHrv;
        const formattedHrvChange = hrvChange > 0 ? `+${hrvChange.toFixed(0)} ms` : `${hrvChange.toFixed(0)} ms`;
        
        hrvTrend.textContent = formattedHrvChange;
        // For HRV, higher is usually better
        if (hrvChange > 0) {
            hrvTrend.className = 'value-up';
        } else if (hrvChange < 0) {
            hrvTrend.className = 'value-down';
        } else {
            hrvTrend.className = 'value-same';
        }
    }
    
    // Update recovery chart
    updateRecoveryChart(recoveryData);
    
    // Update training recommendation
    updateTrainingRecommendation(lastRecovery);
    
    // Last sync time
    const lastSync = new Date(localStorage.getItem('lastWhoopSync'));
    const syncTimeDisplay = document.getElementById('last-sync-time');
    if (syncTimeDisplay && !isNaN(lastSync)) {
        syncTimeDisplay.textContent = `Last synced: ${lastSync.toLocaleString()}`;
    }
}

/**
 * Update the recovery chart with the last 7 days of data
 * @param {Array} recoveryData - Array of daily recovery data
 */
function updateRecoveryChart(recoveryData) {
    const recoveryChart = document.getElementById('recovery-chart');
    if (!recoveryChart || !recoveryData || recoveryData.length === 0) return;
    
    recoveryChart.innerHTML = '';
    
    recoveryData.forEach((day, index) => {
        const bar = document.createElement('div');
        bar.className = 'recovery-bar';
        bar.style.height = `${day.score}%`;
        bar.style.left = `${10 + index * 15}px`;
        
        // Color code based on recovery level
        if (day.score >= 80) {
            bar.style.backgroundColor = '#27ae60'; // Green for high recovery
        } else if (day.score < 50) {
            bar.style.backgroundColor = '#e67e22'; // Orange for low recovery
        }
        
        // Add date tooltip
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        bar.title = `${formattedDate}: ${day.score}%`;
        
        recoveryChart.appendChild(bar);
    });
}

/**
 * Update training recommendation based on recovery
 * @param {Object} recovery - Latest recovery data
 */
function updateTrainingRecommendation(recovery) {
    const recommendationElem = document.getElementById('recovery-recommendation');
    if (!recommendationElem) return;
    
    if (!recovery) {
        recommendationElem.textContent = 'Connect your Whoop for personalized training recommendations.';
        return;
    }
    
    const score = recovery.score;
    let recommendation = '';
    
    if (score >= 85) {
        recommendation = 'Excellent recovery. Push for PRs and higher intensity. Aim for 0-1 RIR on main lifts.';
    } else if (score >= 70) {
        recommendation = 'Good recovery. Proceed with normal training as planned. Follow your regular intensity and volume.';
    } else if (score >= 55) {
        recommendation = 'Moderate recovery. Consider reducing weight by 5-10% or decreasing total sets. Focus on quality over quantity.';
    } else {
        recommendation = 'Poor recovery. Focus on technique and mobility. Reduce weight by 20-30% or consider an active recovery day instead.';
    }
    
    recommendationElem.textContent = recommendation;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Listen for Whoop authentication completion
    window.addEventListener('whoopAuthenticated', function() {
        initializeWhoopConnection();
    });
    
    // Listen for Whoop data updates
    window.addEventListener('whoopDataUpdated', function() {
        updateDashboardWithWhoopData();
    });
}