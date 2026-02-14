// Data Updater for Training Dashboard
// Allows updating personal training data directly from mobile devices

document.addEventListener('DOMContentLoaded', function() {
    // Setup data updater UI if user is logged in with GitHub
    setupDataUpdater();
    
    // Listen for tab changes
    const dataTabs = document.querySelectorAll('.data-tab');
    if (dataTabs) {
        dataTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                switchDataTab(this.getAttribute('data-tab'));
            });
        });
    }
});

/**
 * Set up the data updater UI
 */
function setupDataUpdater() {
    const dataUpdaterContainer = document.getElementById('data-updater-container');
    if (!dataUpdaterContainer) return;
    
    // Check if GitHub token is stored
    const githubToken = localStorage.getItem('githubToken');
    
    if (githubToken) {
        // User is already logged in
        showDataUpdateForms();
    } else {
        // Show GitHub login button
        dataUpdaterContainer.innerHTML = `
            <div class="github-login-section">
                <h3>Update Training Data</h3>
                <p>To update your training data from your phone, you need to login with GitHub first.</p>
                <button id="github-login-button" class="github-login-button">
                    <i class="github-icon"></i>
                    Login with GitHub
                </button>
            </div>
        `;
        
        document.getElementById('github-login-button').addEventListener('click', startGitHubAuth);
    }
}

/**
 * Start GitHub authentication flow
 */
function startGitHubAuth() {
    // This uses GitHub's OAuth flow
    const clientId = 'YOUR_GITHUB_OAUTH_CLIENT_ID'; // Replace with your GitHub OAuth App client ID
    const redirectUri = encodeURIComponent(window.location.origin + '/github-callback.html');
    const scope = encodeURIComponent('repo');
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    // Open popup for GitHub auth
    const popupWindow = window.open(authUrl, 'GitHub Authentication', 'width=600,height=700');
    
    // Listen for message from popup
    window.addEventListener('message', async event => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GITHUB_AUTH_CODE') {
            const code = event.data.code;
            try {
                // Exchange code for token via backend proxy (to avoid exposing client secret)
                const tokenResponse = await exchangeCodeForToken(code);
                localStorage.setItem('githubToken', tokenResponse.access_token);
                popupWindow.close();
                
                // Show data update forms
                showDataUpdateForms();
            } catch (error) {
                console.error('Failed to authenticate with GitHub:', error);
                alert('GitHub authentication failed. Please try again.');
            }
        }
    });
}

/**
 * Exchange code for GitHub token
 * This requires a small backend proxy to avoid exposing your client secret
 */
async function exchangeCodeForToken(code) {
    // In a real implementation, you'd send the code to your backend proxy
    // For demo purposes, we'll simulate a successful response
    return { access_token: 'simulated_github_token' };
    
    /*
    Example of actual implementation:
    const response = await fetch('https://your-backend-proxy.com/github/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
        throw new Error('Failed to exchange code for token');
    }
    
    return await response.json();
    */
}

/**
 * Show the data update forms
 */
function showDataUpdateForms() {
    const dataUpdaterContainer = document.getElementById('data-updater-container');
    if (!dataUpdaterContainer) return;
    
    dataUpdaterContainer.innerHTML = `
        <h3>Update Training Data</h3>
        
        <div class="data-tabs">
            <div class="data-tab active" data-tab="workout">Workout</div>
            <div class="data-tab" data-tab="body-metrics">Body Metrics</div>
            <div class="data-tab" data-tab="current-stats">Stats</div>
            <div class="data-tab" data-tab="pr-targets">PR Targets</div>
        </div>
        
        <div class="data-content-container">
            <div id="workout-form" class="data-content active">
                <h4>Log New Workout</h4>
                <form id="workout-form">
                    <div class="form-group">
                        <label for="workout-date">Date</label>
                        <input type="date" id="workout-date" required>
                    </div>
                    <div class="form-group">
                        <label for="workout-type">Workout Type</label>
                        <select id="workout-type" required>
                            <option value="push">Push</option>
                            <option value="pull">Pull</option>
                            <option value="legs">Legs</option>
                            <option value="upper">Upper</option>
                            <option value="lower">Lower</option>
                            <option value="full">Full Body</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="workout-notes">Notes</label>
                        <textarea id="workout-notes" rows="2"></textarea>
                    </div>
                    
                    <div id="exercises-container">
                        <div class="exercise-entry">
                            <div class="form-group">
                                <label>Exercise</label>
                                <input type="text" class="exercise-name" placeholder="e.g. Bench Press" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Weight</label>
                                    <input type="number" class="exercise-weight" step="0.5" required>
                                </div>
                                <div class="form-group">
                                    <label>Reps</label>
                                    <input type="number" class="exercise-reps" required>
                                </div>
                                <div class="form-group">
                                    <label>Sets</label>
                                    <input type="number" class="exercise-sets" min="1" value="3" required>
                                </div>
                                <div class="form-group">
                                    <label>RIR</label>
                                    <input type="number" class="exercise-rir" step="0.5" min="0" max="5" value="1">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button type="button" id="add-exercise-btn" class="secondary-button">+ Add Exercise</button>
                    
                    <button type="submit" class="submit-button">Save Workout</button>
                </form>
            </div>
            
            <div id="body-metrics-form" class="data-content">
                <h4>Update Body Metrics</h4>
                <form id="body-metrics-form">
                    <div class="form-group">
                        <label for="metrics-date">Date</label>
                        <input type="date" id="metrics-date" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="body-weight">Weight (kg)</label>
                            <input type="number" id="body-weight" step="0.1" required>
                        </div>
                        <div class="form-group">
                            <label for="body-fat">Body Fat %</label>
                            <input type="number" id="body-fat" step="0.1" min="3" max="40">
                        </div>
                    </div>
                    
                    <h5>Measurements (cm)</h5>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="chest-measurement">Chest</label>
                            <input type="number" id="chest-measurement" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="shoulders-measurement">Shoulders</label>
                            <input type="number" id="shoulders-measurement" step="0.1">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="left-arm-measurement">Left Arm</label>
                            <input type="number" id="left-arm-measurement" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="right-arm-measurement">Right Arm</label>
                            <input type="number" id="right-arm-measurement" step="0.1">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="waist-measurement">Waist</label>
                            <input type="number" id="waist-measurement" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="hips-measurement">Hips</label>
                            <input type="number" id="hips-measurement" step="0.1">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="left-thigh-measurement">Left Thigh</label>
                            <input type="number" id="left-thigh-measurement" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="right-thigh-measurement">Right Thigh</label>
                            <input type="number" id="right-thigh-measurement" step="0.1">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="left-calf-measurement">Left Calf</label>
                            <input type="number" id="left-calf-measurement" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="right-calf-measurement">Right Calf</label>
                            <input type="number" id="right-calf-measurement" step="0.1">
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-button">Save Metrics</button>
                </form>
            </div>
            
            <div id="current-stats-form" class="data-content">
                <h4>Update Current Stats</h4>
                <form id="stats-form">
                    <div class="form-group">
                        <label for="current-weight">Current Weight (kg)</label>
                        <input type="number" id="current-weight" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label for="target-weight">Target Weight (kg)</label>
                        <input type="number" id="target-weight" step="0.1" required>
                    </div>
                    
                    <h5>Current Exercise Performance</h5>
                    <p class="form-hint">Enter your current working weights</p>
                    
                    <div class="stats-exercise-entry">
                        <label>Flat Bench</label>
                        <div class="form-row">
                            <input type="number" id="bench-sets" placeholder="Sets" min="1" max="10" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="bench-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">@</span>
                            <input type="number" id="bench-weight" placeholder="kg" step="0.5" class="small-input">
                        </div>
                    </div>
                    
                    <div class="stats-exercise-entry">
                        <label>Incline Press</label>
                        <div class="form-row">
                            <input type="number" id="incline-sets" placeholder="Sets" min="1" max="10" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="incline-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">@</span>
                            <input type="number" id="incline-weight" placeholder="kg" step="0.5" class="small-input">
                        </div>
                    </div>
                    
                    <div class="stats-exercise-entry">
                        <label>Shoulder Press</label>
                        <div class="form-row">
                            <input type="number" id="shoulder-sets" placeholder="Sets" min="1" max="10" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="shoulder-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">@</span>
                            <input type="number" id="shoulder-weight" placeholder="kg" step="0.5" class="small-input">
                        </div>
                    </div>
                    
                    <div class="stats-exercise-entry">
                        <label>Lat Pulldown</label>
                        <div class="form-row">
                            <input type="number" id="lat-sets" placeholder="Sets" min="1" max="10" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="lat-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">@</span>
                            <input type="number" id="lat-weight" placeholder="kg" step="0.5" class="small-input">
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-button">Save Stats</button>
                </form>
            </div>
            
            <div id="pr-targets-form" class="data-content">
                <h4>Update PR Targets</h4>
                <p class="form-hint">Set your goal weights for the end of the Beast Cycle</p>
                
                <form id="pr-targets-form">
                    <div class="stats-exercise-entry">
                        <label>Bench Press</label>
                        <div class="form-row">
                            <input type="number" id="bench-target-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="bench-target-weight" placeholder="kg" step="0.5" class="medium-input">
                        </div>
                    </div>
                    
                    <div class="stats-exercise-entry">
                        <label>Shoulder Press</label>
                        <div class="form-row">
                            <input type="number" id="shoulder-target-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="shoulder-target-weight" placeholder="kg" step="0.5" class="medium-input">
                        </div>
                    </div>
                    
                    <div class="stats-exercise-entry">
                        <label>Lat Pulldown</label>
                        <div class="form-row">
                            <input type="number" id="lat-target-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="lat-target-weight" placeholder="kg" step="0.5" class="medium-input">
                        </div>
                    </div>
                    
                    <div class="stats-exercise-entry">
                        <label>Leg Press</label>
                        <div class="form-row">
                            <input type="number" id="legpress-target-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="legpress-target-weight" placeholder="kg" step="0.5" class="medium-input">
                        </div>
                    </div>
                    
                    <div class="stats-exercise-entry">
                        <label>Standing Calf Raise</label>
                        <div class="form-row">
                            <input type="number" id="calf-target-reps" placeholder="Reps" min="1" max="50" class="small-input">
                            <span class="form-separator">×</span>
                            <input type="number" id="calf-target-weight" placeholder="kg" step="0.5" class="medium-input">
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-button">Save PR Targets</button>
                </form>
            </div>
        </div>
    `;
    
    // Add event listeners for forms
    setupFormEventListeners();
    
    // Set up exercise add button
    document.getElementById('add-exercise-btn').addEventListener('click', addExerciseField);
    
    // Prefill form with existing data
    prefillFormsWithExistingData();
}

/**
 * Switch between data tabs
 */
function switchDataTab(tabId) {
    // Hide all content
    document.querySelectorAll('.data-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Deactivate all tabs
    document.querySelectorAll('.data-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activate selected tab and content
    document.querySelector(`.data-tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-form`).classList.add('active');
}

/**
 * Add a new exercise field to the workout form
 */
function addExerciseField() {
    const container = document.getElementById('exercises-container');
    const newExercise = document.createElement('div');
    newExercise.className = 'exercise-entry';
    newExercise.innerHTML = `
        <div class="exercise-header">
            <div class="form-group">
                <label>Exercise</label>
                <input type="text" class="exercise-name" placeholder="e.g. Bench Press" required>
            </div>
            <button type="button" class="remove-exercise-btn">×</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Weight</label>
                <input type="number" class="exercise-weight" step="0.5" required>
            </div>
            <div class="form-group">
                <label>Reps</label>
                <input type="number" class="exercise-reps" required>
            </div>
            <div class="form-group">
                <label>Sets</label>
                <input type="number" class="exercise-sets" min="1" value="3" required>
            </div>
            <div class="form-group">
                <label>RIR</label>
                <input type="number" class="exercise-rir" step="0.5" min="0" max="5" value="1">
            </div>
        </div>
    `;
    container.appendChild(newExercise);
    
    // Add remove button event listener
    newExercise.querySelector('.remove-exercise-btn').addEventListener('click', function() {
        container.removeChild(newExercise);
    });
}

/**
 * Set up event listeners for the forms
 */
function setupFormEventListeners() {
    // Workout form
    const workoutForm = document.getElementById('workout-form');
    if (workoutForm) {
        workoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWorkoutData();
        });
    }
    
    // Body metrics form
    const metricsForm = document.getElementById('body-metrics-form');
    if (metricsForm) {
        metricsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBodyMetricsData();
        });
    }
    
    // Stats form
    const statsForm = document.getElementById('stats-form');
    if (statsForm) {
        statsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveStatsData();
        });
    }
    
    // PR targets form
    const prTargetsForm = document.getElementById('pr-targets-form');
    if (prTargetsForm) {
        prTargetsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePRTargetsData();
        });
    }
}

/**
 * Prefill forms with existing data
 */
function prefillFormsWithExistingData() {
    // Get user data
    fetch('data/user_data.json')
        .then(response => response.json())
        .then(data => {
            // Prefill current stats
            if (data.user) {
                document.getElementById('current-weight').value = data.user.weight || '';
                document.getElementById('target-weight').value = data.user.target_weight || '';
            }
            
            // Prefill current exercise performance
            if (data.performance && data.performance.current) {
                const current = data.performance.current;
                
                // Parse performance strings like "3×10 @ 60kg"
                const parseBenchPerformance = (perfString) => {
                    const matches = perfString.match(/(\d+)×(\d+) @ (\d+(?:\.\d+)?)kg/);
                    if (matches && matches.length === 4) {
                        return {
                            sets: matches[1],
                            reps: matches[2],
                            weight: matches[3]
                        };
                    }
                    return { sets: '', reps: '', weight: '' };
                };
                
                // Flat bench
                if (current.flat_bench) {
                    const bench = parseBenchPerformance(current.flat_bench);
                    document.getElementById('bench-sets').value = bench.sets;
                    document.getElementById('bench-reps').value = bench.reps;
                    document.getElementById('bench-weight').value = bench.weight;
                }
                
                // Incline press
                if (current.incline_press) {
                    const incline = parseBenchPerformance(current.incline_press);
                    document.getElementById('incline-sets').value = incline.sets;
                    document.getElementById('incline-reps').value = incline.reps;
                    document.getElementById('incline-weight').value = incline.weight;
                }
                
                // Shoulder press
                if (current.shoulder_press) {
                    const shoulder = parseBenchPerformance(current.shoulder_press);
                    document.getElementById('shoulder-sets').value = shoulder.sets;
                    document.getElementById('shoulder-reps').value = shoulder.reps;
                    document.getElementById('shoulder-weight').value = shoulder.weight;
                }
                
                // Lat pulldown
                if (current.lat_pulldown) {
                    const lat = parseBenchPerformance(current.lat_pulldown);
                    document.getElementById('lat-sets').value = lat.sets;
                    document.getElementById('lat-reps').value = lat.reps;
                    document.getElementById('lat-weight').value = lat.weight;
                }
            }
            
            // Prefill PR targets
            if (data.performance && data.performance.pr_targets) {
                const targets = data.performance.pr_targets;
                
                // Parse PR target strings like "100kg × 8"
                const parsePRTarget = (targetString) => {
                    const matches = targetString.match(/(\d+(?:\.\d+)?)kg × (\d+)/);
                    if (matches && matches.length === 3) {
                        return {
                            weight: matches[1],
                            reps: matches[2]
                        };
                    }
                    return { weight: '', reps: '' };
                };
                
                // Bench press
                if (targets.bench_press) {
                    const bench = parsePRTarget(targets.bench_press);
                    document.getElementById('bench-target-reps').value = bench.reps;
                    document.getElementById('bench-target-weight').value = bench.weight;
                }
                
                // Shoulder press
                if (targets.shoulder_press) {
                    const shoulder = parsePRTarget(targets.shoulder_press);
                    document.getElementById('shoulder-target-reps').value = shoulder.reps;
                    document.getElementById('shoulder-target-weight').value = shoulder.weight;
                }
                
                // Lat pulldown
                if (targets.lat_pulldown) {
                    const lat = parsePRTarget(targets.lat_pulldown);
                    document.getElementById('lat-target-reps').value = lat.reps;
                    document.getElementById('lat-target-weight').value = lat.weight;
                }
                
                // Leg press
                if (targets.leg_press) {
                    const legPress = parsePRTarget(targets.leg_press);
                    document.getElementById('legpress-target-reps').value = legPress.reps;
                    document.getElementById('legpress-target-weight').value = legPress.weight;
                }
                
                // Calf raise
                if (targets.standing_calf_raise) {
                    const calf = parsePRTarget(targets.standing_calf_raise);
                    document.getElementById('calf-target-reps').value = calf.reps;
                    document.getElementById('calf-target-weight').value = calf.weight;
                }
            }
        })
        .catch(error => {
            console.error('Error loading user data for form prefill:', error);
        });
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workout-date').value = today;
    document.getElementById('metrics-date').value = today;
}

/**
 * Save workout data
 */
async function saveWorkoutData() {
    try {
        showSavingIndicator('workout-form');
        
        // Collect form data
        const workoutData = {
            date: document.getElementById('workout-date').value,
            type: document.getElementById('workout-type').value,
            notes: document.getElementById('workout-notes').value,
            exercises: []
        };
        
        // Get all exercise entries
        const exerciseEntries = document.querySelectorAll('.exercise-entry');
        exerciseEntries.forEach(entry => {
            const exercise = {
                name: entry.querySelector('.exercise-name').value,
                weight: parseFloat(entry.querySelector('.exercise-weight').value),
                reps: parseInt(entry.querySelector('.exercise-reps').value),
                sets: parseInt(entry.querySelector('.exercise-sets').value),
                rir: parseFloat(entry.querySelector('.exercise-rir').value)
            };
            
            workoutData.exercises.push(exercise);
        });
        
        // Save to local file in data/workouts/
        const workoutFilename = `${workoutData.date}_${workoutData.type}.json`;
        
        // In a full implementation, this would save to GitHub via the API
        // For this demo, we'll save to localStorage
        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        workouts.push(workoutData);
        localStorage.setItem('workouts', JSON.stringify(workouts));
        
        // Show success message
        showSuccessMessage('workout-form', 'Workout saved successfully!');
        
        // Reset form
        document.getElementById('workout-form').reset();
        document.getElementById('workout-date').value = new Date().toISOString().split('T')[0];
        
        // Remove all exercise entries except the first one
        const exerciseContainer = document.getElementById('exercises-container');
        while (exerciseContainer.children.length > 1) {
            exerciseContainer.removeChild(exerciseContainer.lastChild);
        }
        
        // Update dashboard data
        // In a real implementation, this would trigger a dashboard refresh
        
    } catch (error) {
        console.error('Error saving workout data:', error);
        showErrorMessage('workout-form', 'Failed to save workout data. Please try again.');
    }
}

/**
 * Save body metrics data
 */
async function saveBodyMetricsData() {
    try {
        showSavingIndicator('body-metrics-form');
        
        // Collect form data
        const metricsData = {
            date: document.getElementById('metrics-date').value,
            weight: parseFloat(document.getElementById('body-weight').value),
            bodyFat: document.getElementById('body-fat').value ? parseFloat(document.getElementById('body-fat').value) : null,
            measurements: {
                chest: document.getElementById('chest-measurement').value ? parseFloat(document.getElementById('chest-measurement').value) : null,
                shoulders: document.getElementById('shoulders-measurement').value ? parseFloat(document.getElementById('shoulders-measurement').value) : null,
                leftArm: document.getElementById('left-arm-measurement').value ? parseFloat(document.getElementById('left-arm-measurement').value) : null,
                rightArm: document.getElementById('right-arm-measurement').value ? parseFloat(document.getElementById('right-arm-measurement').value) : null,
                waist: document.getElementById('waist-measurement').value ? parseFloat(document.getElementById('waist-measurement').value) : null,
                hips: document.getElementById('hips-measurement').value ? parseFloat(document.getElementById('hips-measurement').value) : null,
                leftThigh: document.getElementById('left-thigh-measurement').value ? parseFloat(document.getElementById('left-thigh-measurement').value) : null,
                rightThigh: document.getElementById('right-thigh-measurement').value ? parseFloat(document.getElementById('right-thigh-measurement').value) : null,
                leftCalf: document.getElementById('left-calf-measurement').value ? parseFloat(document.getElementById('left-calf-measurement').value) : null,
                rightCalf: document.getElementById('right-calf-measurement').value ? parseFloat(document.getElementById('right-calf-measurement').value) : null
            }
        };
        
        // In a full implementation, this would save to GitHub via the API
        // For this demo, we'll save to localStorage
        const metrics = JSON.parse(localStorage.getItem('bodyMetrics') || '[]');
        metrics.push(metricsData);
        localStorage.setItem('bodyMetrics', JSON.stringify(metrics));
        
        // Update current weight in user data
        updateUserWeight(metricsData.weight);
        
        // Show success message
        showSuccessMessage('body-metrics-form', 'Body metrics saved successfully!');
        
        // Reset form
        document.getElementById('body-metrics-form').reset();
        document.getElementById('metrics-date').value = new Date().toISOString().split('T')[0];
        
    } catch (error) {
        console.error('Error saving body metrics data:', error);
        showErrorMessage('body-metrics-form', 'Failed to save body metrics data. Please try again.');
    }
}

/**
 * Save current stats data
 */
async function saveStatsData() {
    try {
        showSavingIndicator('stats-form');
        
        // Get existing user data
        const userData = await fetchUserData();
        
        // Update user weight
        userData.user.weight = parseFloat(document.getElementById('current-weight').value);
        userData.user.target_weight = document.getElementById('target-weight').value;
        
        // Update current exercise performance
        userData.performance = userData.performance || {};
        userData.performance.current = userData.performance.current || {};
        
        // Bench press
        const benchSets = document.getElementById('bench-sets').value;
        const benchReps = document.getElementById('bench-reps').value;
        const benchWeight = document.getElementById('bench-weight').value;
        if (benchSets && benchReps && benchWeight) {
            userData.performance.current.flat_bench = `${benchSets}×${benchReps} @ ${benchWeight}kg`;
        }
        
        // Incline press
        const inclineSets = document.getElementById('incline-sets').value;
        const inclineReps = document.getElementById('incline-reps').value;
        const inclineWeight = document.getElementById('incline-weight').value;
        if (inclineSets && inclineReps && inclineWeight) {
            userData.performance.current.incline_press = `${inclineSets}×${inclineReps} @ ${inclineWeight}kg`;
        }
        
        // Shoulder press
        const shoulderSets = document.getElementById('shoulder-sets').value;
        const shoulderReps = document.getElementById('shoulder-reps').value;
        const shoulderWeight = document.getElementById('shoulder-weight').value;
        if (shoulderSets && shoulderReps && shoulderWeight) {
            userData.performance.current.shoulder_press = `${shoulderSets}×${shoulderReps} @ ${shoulderWeight}kg`;
        }
        
        // Lat pulldown
        const latSets = document.getElementById('lat-sets').value;
        const latReps = document.getElementById('lat-reps').value;
        const latWeight = document.getElementById('lat-weight').value;
        if (latSets && latReps && latWeight) {
            userData.performance.current.lat_pulldown = `${latSets}×${latReps} @ ${latWeight}kg`;
        }
        
        // In a full implementation, this would save to GitHub via the API
        // For this demo, we'll save to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show success message
        showSuccessMessage('stats-form', 'Stats updated successfully!');
        
        // Update dashboard
        updateDashboardWithNewData(userData);
        
    } catch (error) {
        console.error('Error saving stats data:', error);
        showErrorMessage('stats-form', 'Failed to update stats. Please try again.');
    }
}

/**
 * Save PR targets data
 */
async function savePRTargetsData() {
    try {
        showSavingIndicator('pr-targets-form');
        
        // Get existing user data
        const userData = await fetchUserData();
        
        // Ensure performance and pr_targets objects exist
        userData.performance = userData.performance || {};
        userData.performance.pr_targets = userData.performance.pr_targets || {};
        
        // Bench press
        const benchReps = document.getElementById('bench-target-reps').value;
        const benchWeight = document.getElementById('bench-target-weight').value;
        if (benchReps && benchWeight) {
            userData.performance.pr_targets.bench_press = `${benchWeight}kg × ${benchReps}`;
        }
        
        // Shoulder press
        const shoulderReps = document.getElementById('shoulder-target-reps').value;
        const shoulderWeight = document.getElementById('shoulder-target-weight').value;
        if (shoulderReps && shoulderWeight) {
            userData.performance.pr_targets.shoulder_press = `${shoulderWeight}kg × ${shoulderReps}`;
        }
        
        // Lat pulldown
        const latReps = document.getElementById('lat-target-reps').value;
        const latWeight = document.getElementById('lat-target-weight').value;
        if (latReps && latWeight) {
            userData.performance.pr_targets.lat_pulldown = `${latWeight}kg × ${latReps}`;
        }
        
        // Leg press
        const legpressReps = document.getElementById('legpress-target-reps').value;
        const legpressWeight = document.getElementById('legpress-target-weight').value;
        if (legpressReps && legpressWeight) {
            userData.performance.pr_targets.leg_press = `${legpressWeight}kg × ${legpressReps}`;
        }
        
        // Calf raise
        const calfReps = document.getElementById('calf-target-reps').value;
        const calfWeight = document.getElementById('calf-target-weight').value;
        if (calfReps && calfWeight) {
            userData.performance.pr_targets.standing_calf_raise = `${calfWeight}kg × ${calfReps}`;
        }
        
        // In a full implementation, this would save to GitHub via the API
        // For this demo, we'll save to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show success message
        showSuccessMessage('pr-targets-form', 'PR targets updated successfully!');
        
        // Update dashboard
        updateDashboardWithNewData(userData);
        
    } catch (error) {
        console.error('Error saving PR targets data:', error);
        showErrorMessage('pr-targets-form', 'Failed to update PR targets. Please try again.');
    }
}

/**
 * Fetch user data
 */
async function fetchUserData() {
    // Try to get from localStorage first
    const storedData = localStorage.getItem('userData');
    if (storedData) {
        return JSON.parse(storedData);
    }
    
    // If not in localStorage, fetch from file
    const response = await fetch('data/user_data.json');
    const userData = await response.json();
    return userData;
}

/**
 * Update user weight in user data
 */
async function updateUserWeight(weight) {
    try {
        // Get existing user data
        const userData = await fetchUserData();
        
        // Update weight
        userData.user.weight = weight;
        
        // In a full implementation, this would save to GitHub via the API
        // For this demo, we'll save to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update dashboard weight display
        const currentWeightDisplay = document.getElementById('current-weight');
        if (currentWeightDisplay) {
            currentWeightDisplay.textContent = `${weight} kg`;
        }
        
    } catch (error) {
        console.error('Error updating user weight:', error);
    }
}

/**
 * Update dashboard with new data
 */
function updateDashboardWithNewData(userData) {
    // Update weight displays
    document.getElementById('current-weight').textContent = `${userData.user.weight} kg`;
    document.getElementById('target-weight').textContent = userData.user.target_weight;
    
    // Update PR targets list
    const targetList = document.getElementById('target-list');
    if (targetList && userData.performance && userData.performance.pr_targets) {
        targetList.innerHTML = '';
        
        for (const [exercise, target] of Object.entries(userData.performance.pr_targets)) {
            const li = document.createElement('li');
            const exerciseName = formatExerciseName(exercise);
            li.innerHTML = `
                <span class="target-exercise">${exerciseName}</span>
                <span class="target-value">${target}</span>
            `;
            targetList.appendChild(li);
        }
    }
    
    // Helper to format exercise names
    function formatExerciseName(camelCase) {
        return camelCase
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

/**
 * Show saving indicator
 */
function showSavingIndicator(formId) {
    const form = document.getElementById(formId);
    const submitButton = form.querySelector('.submit-button');
    
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';
    }
    
    // Remove any existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

/**
 * Show success message
 */
function showSuccessMessage(formId, message) {
    const form = document.getElementById(formId);
    const submitButton = form.querySelector('.submit-button');
    
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Save';
    }
    
    // Remove any existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Add success message
    const messageElement = document.createElement('div');
    messageElement.className = 'form-message success-message';
    messageElement.textContent = message;
    form.appendChild(messageElement);
    
    // Auto-remove message after 3 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 3000);
}

/**
 * Show error message
 */
function showErrorMessage(formId, message) {
    const form = document.getElementById(formId);
    const submitButton = form.querySelector('.submit-button');
    
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Save';
    }
    
    // Remove any existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Add error message
    const messageElement = document.createElement('div');
    messageElement.className = 'form-message error-message';
    messageElement.textContent = message;
    form.appendChild(messageElement);
}