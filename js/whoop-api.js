// Whoop API Integration for Training Dashboard
// This module handles authentication, data fetching and processing from Whoop API

class WhoopAPI {
    constructor() {
        this.baseUrl = 'https://api.whoop.com';
        this.apiVersion = 'v1';
        this.token = localStorage.getItem('whoopAccessToken') || null;
        this.refreshToken = localStorage.getItem('whoopRefreshToken') || null;
        this.tokenExpiry = localStorage.getItem('whoopTokenExpiry') || null;
        this.user = JSON.parse(localStorage.getItem('whoopUser') || '{}');
        this.lastSyncDate = localStorage.getItem('lastWhoopSync') || null;
    }

    /**
     * Initialize the Whoop API connection
     * - Checks if we have a valid token
     * - If not, starts the auth process
     * - If yes, validates the token and refreshes if needed
     */
    async initialize() {
        if (!this.token || this.isTokenExpired()) {
            // We need to authenticate or re-authenticate
            return false;
        }
        
        try {
            // Validate token by fetching user profile
            await this.fetchUserProfile();
            return true;
        } catch (error) {
            console.error('Error validating Whoop token:', error);
            // If we have a refresh token, try to refresh
            if (this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    return true;
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    return false;
                }
            }
            return false;
        }
    }

    /**
     * Check if the current token is expired
     */
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        
        const expiryDate = new Date(this.tokenExpiry);
        const now = new Date();
        
        // Consider token expired 5 minutes before actual expiry
        return (expiryDate.getTime() - now.getTime()) < 300000;
    }

    /**
     * Start OAuth authentication flow
     * This opens a popup window for Whoop authentication
     */
    startAuthentication() {
        const clientId = 'YOUR_WHOOP_CLIENT_ID'; // Replace with your Whoop API client ID
        const redirectUri = encodeURIComponent(window.location.origin + '/whoop-callback.html');
        const scope = encodeURIComponent('read:recovery read:sleep read:workout read:profile');
        
        const authUrl = `${this.baseUrl}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        
        // Open popup window for authentication
        const popupWindow = window.open(authUrl, 'Whoop Authentication', 'width=600,height=700');
        
        // Setup message listener for the redirect callback
        window.addEventListener('message', async (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'WHOOP_AUTH_CODE') {
                const authCode = event.data.code;
                try {
                    await this.exchangeCodeForToken(authCode);
                    popupWindow.close();
                    window.dispatchEvent(new Event('whoopAuthenticated'));
                } catch (error) {
                    console.error('Error exchanging code for token:', error);
                    alert('Failed to complete Whoop authentication. Please try again.');
                    popupWindow.close();
                }
            }
        });
    }

    /**
     * Exchange authorization code for access token
     * @param {string} code - The auth code from redirect
     */
    async exchangeCodeForToken(code) {
        const clientId = 'YOUR_WHOOP_CLIENT_ID'; // Replace with your Whoop API client ID
        const clientSecret = 'YOUR_WHOOP_CLIENT_SECRET'; // Replace with your Whoop API client secret
        const redirectUri = window.location.origin + '/whoop-callback.html';
        
        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to exchange code: ${error}`);
        }
        
        const data = await response.json();
        this.saveTokenData(data);
        await this.fetchUserProfile();
    }

    /**
     * Refresh the access token using refresh token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        
        const clientId = 'YOUR_WHOOP_CLIENT_ID';
        const clientSecret = 'YOUR_WHOOP_CLIENT_SECRET';
        
        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to refresh token: ${error}`);
        }
        
        const data = await response.json();
        this.saveTokenData(data);
    }

    /**
     * Save token data to local storage and instance
     * @param {Object} data - Token response data
     */
    saveTokenData(data) {
        this.token = data.access_token;
        this.refreshToken = data.refresh_token;
        
        // Calculate token expiry time
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in);
        this.tokenExpiry = expiryDate.toISOString();
        
        // Save to localStorage
        localStorage.setItem('whoopAccessToken', this.token);
        localStorage.setItem('whoopRefreshToken', this.refreshToken);
        localStorage.setItem('whoopTokenExpiry', this.tokenExpiry);
    }

    /**
     * Fetch user profile from Whoop API
     */
    async fetchUserProfile() {
        const response = await this.apiRequest('/user');
        this.user = response;
        localStorage.setItem('whoopUser', JSON.stringify(this.user));
        return this.user;
    }

    /**
     * Fetch recovery data for a specific date range
     * @param {string} startDate - ISO date string for start date
     * @param {string} endDate - ISO date string for end date (optional)
     */
    async fetchRecoveryData(startDate, endDate = null) {
        const endDateParam = endDate ? `&end_date=${endDate}` : '';
        const endpoint = `/recovery?start_date=${startDate}${endDateParam}`;
        
        const response = await this.apiRequest(endpoint);
        return response;
    }

    /**
     * Fetch sleep data for a specific date range
     * @param {string} startDate - ISO date string for start date
     * @param {string} endDate - ISO date string for end date (optional)
     */
    async fetchSleepData(startDate, endDate = null) {
        const endDateParam = endDate ? `&end_date=${endDate}` : '';
        const endpoint = `/sleep?start_date=${startDate}${endDateParam}`;
        
        const response = await this.apiRequest(endpoint);
        return response;
    }

    /**
     * Fetch workout data for a specific date range
     * @param {string} startDate - ISO date string for start date
     * @param {string} endDate - ISO date string for end date (optional)
     */
    async fetchWorkoutData(startDate, endDate = null) {
        const endDateParam = endDate ? `&end_date=${endDate}` : '';
        const endpoint = `/workout?start_date=${startDate}${endDateParam}`;
        
        const response = await this.apiRequest(endpoint);
        return response;
    }

    /**
     * Make a request to the Whoop API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     */
    async apiRequest(endpoint, method = 'GET') {
        if (!this.token) {
            throw new Error('No access token available');
        }
        
        const url = `${this.baseUrl}/${this.apiVersion}${endpoint}`;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API request failed: ${error}`);
        }
        
        return await response.json();
    }

    /**
     * Sync all relevant Whoop data for the dashboard
     * Fetches recovery, sleep, and workout data for the last 30 days
     */
    async syncWhoopData() {
        try {
            // Calculate date range - last 30 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            // Fetch all data types
            const recoveryData = await this.fetchRecoveryData(startDateStr, endDateStr);
            const sleepData = await this.fetchSleepData(startDateStr, endDateStr);
            const workoutData = await this.fetchWorkoutData(startDateStr, endDateStr);
            
            // Process and store data
            const processedData = this.processWhoopData(recoveryData, sleepData, workoutData);
            localStorage.setItem('whoopProcessedData', JSON.stringify(processedData));
            localStorage.setItem('lastWhoopSync', new Date().toISOString());
            
            // Dispatch event that data was updated
            window.dispatchEvent(new Event('whoopDataUpdated'));
            
            return processedData;
        } catch (error) {
            console.error('Error syncing Whoop data:', error);
            throw error;
        }
    }

    /**
     * Process Whoop data for dashboard display
     * @param {Object} recoveryData - Recovery data from API
     * @param {Object} sleepData - Sleep data from API
     * @param {Object} workoutData - Workout data from API
     */
    processWhoopData(recoveryData, sleepData, workoutData) {
        // Process and correlate data for dashboard use
        const processed = {
            recovery: {
                daily: [],
                weekly: [],
                trends: {}
            },
            sleep: {
                daily: [],
                weekly: [],
                trends: {}
            },
            workouts: {
                list: [],
                stats: {}
            }
        };
        
        // Process recovery data
        if (recoveryData && recoveryData.records) {
            recoveryData.records.forEach(record => {
                processed.recovery.daily.push({
                    date: record.date,
                    score: record.score,
                    resting_heart_rate: record.resting_heart_rate,
                    hrv: record.hrv_milliseconds
                });
            });
            
            // Calculate weekly averages
            processed.recovery.weekly = this.calculateWeeklyAverages(
                processed.recovery.daily,
                ['score', 'resting_heart_rate', 'hrv']
            );
            
            // Calculate trends
            const recoveryScores = processed.recovery.daily.map(day => day.score);
            processed.recovery.trends.average = this.calculateAverage(recoveryScores);
            processed.recovery.trends.trend = this.calculateTrend(recoveryScores);
        }
        
        // Process sleep data (simplified)
        if (sleepData && sleepData.records) {
            sleepData.records.forEach(record => {
                processed.sleep.daily.push({
                    date: record.date,
                    hours: record.total_sleep_hours,
                    efficiency: record.efficiency,
                    quality: record.sleep_quality
                });
            });
        }
        
        return processed;
    }

    /**
     * Calculate weekly averages from daily data
     * @param {Array} dailyData - Array of daily data points
     * @param {Array} fields - Fields to calculate averages for
     */
    calculateWeeklyAverages(dailyData, fields) {
        const weeks = {};
        
        dailyData.forEach(day => {
            const date = new Date(day.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeks[weekKey]) {
                weeks[weekKey] = {
                    week_start: weekKey,
                    counts: {},
                    sums: {}
                };
                
                fields.forEach(field => {
                    weeks[weekKey].counts[field] = 0;
                    weeks[weekKey].sums[field] = 0;
                });
            }
            
            fields.forEach(field => {
                if (day[field] !== undefined && day[field] !== null) {
                    weeks[weekKey].counts[field]++;
                    weeks[weekKey].sums[field] += day[field];
                }
            });
        });
        
        // Calculate averages
        const weeklyAverages = Object.values(weeks).map(week => {
            const result = { week_start: week.week_start };
            
            fields.forEach(field => {
                if (week.counts[field] > 0) {
                    result[field] = week.sums[field] / week.counts[field];
                } else {
                    result[field] = null;
                }
            });
            
            return result;
        });
        
        return weeklyAverages.sort((a, b) => a.week_start.localeCompare(b.week_start));
    }

    /**
     * Calculate average of an array of numbers
     * @param {Array} values - Array of numeric values
     */
    calculateAverage(values) {
        if (!values.length) return null;
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
    }

    /**
     * Calculate trend (improving, declining, stable)
     * @param {Array} values - Array of values
     */
    calculateTrend(values) {
        if (values.length < 7) return 'insufficient_data';
        
        const recent = values.slice(-7);
        const older = values.slice(-14, -7);
        
        const recentAvg = this.calculateAverage(recent);
        const olderAvg = this.calculateAverage(older);
        
        const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (percentChange > 5) return 'improving';
        if (percentChange < -5) return 'declining';
        return 'stable';
    }

    /**
     * Get the latest recovery score for training adjustment
     */
    getLatestRecoveryScore() {
        const data = JSON.parse(localStorage.getItem('whoopProcessedData') || '{}');
        if (data.recovery && data.recovery.daily && data.recovery.daily.length > 0) {
            // Sort by date descending
            const sorted = [...data.recovery.daily].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
            return sorted[0];
        }
        return null;
    }

    /**
     * Get recovery data for the last 7 days
     */
    getLast7DaysRecovery() {
        const data = JSON.parse(localStorage.getItem('whoopProcessedData') || '{}');
        if (data.recovery && data.recovery.daily && data.recovery.daily.length > 0) {
            // Sort by date ascending
            const sorted = [...data.recovery.daily].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
            return sorted.slice(-7);
        }
        return [];
    }

    /**
     * Adjust training intensity based on recovery score
     * @param {Object} workoutPlan - The current workout plan
     */
    adjustTrainingIntensity(workoutPlan) {
        const latestRecovery = this.getLatestRecoveryScore();
        
        if (!latestRecovery) return workoutPlan;
        
        const adjustedPlan = {...workoutPlan};
        const score = latestRecovery.score;
        
        // Adjust based on recovery score
        if (score >= 85) {
            // Excellent recovery - increase intensity
            adjustedPlan.intensityAdjustment = 1.1; // 10% increase
            adjustedPlan.recommendation = "Excellent recovery. Push for PRs and higher intensity.";
        } else if (score >= 70) {
            // Good recovery - normal training
            adjustedPlan.intensityAdjustment = 1.0;
            adjustedPlan.recommendation = "Good recovery. Proceed with normal training as planned.";
        } else if (score >= 55) {
            // Moderate recovery - slightly reduce
            adjustedPlan.intensityAdjustment = 0.9; // 10% decrease
            adjustedPlan.recommendation = "Moderate recovery. Slightly reduce training intensity or volume.";
        } else {
            // Poor recovery - significantly reduce
            adjustedPlan.intensityAdjustment = 0.7; // 30% decrease
            adjustedPlan.recommendation = "Poor recovery. Focus on technique and mobility. Reduce volume and intensity.";
        }
        
        return adjustedPlan;
    }

    /**
     * Logout and clear all Whoop data
     */
    logout() {
        localStorage.removeItem('whoopAccessToken');
        localStorage.removeItem('whoopRefreshToken');
        localStorage.removeItem('whoopTokenExpiry');
        localStorage.removeItem('whoopUser');
        localStorage.removeItem('whoopProcessedData');
        localStorage.removeItem('lastWhoopSync');
        
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.user = {};
    }
}

// Create global instance
const whoopAPI = new WhoopAPI();

// Automatic sync every 6 hours
setInterval(() => {
    if (whoopAPI.token && !whoopAPI.isTokenExpired()) {
        whoopAPI.syncWhoopData()
            .then(() => console.log('Whoop data synced automatically'))
            .catch(err => console.error('Auto-sync failed:', err));
    }
}, 6 * 60 * 60 * 1000);

// Export the API instance
window.whoopAPI = whoopAPI;