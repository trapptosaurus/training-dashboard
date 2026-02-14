// Simple body measurements visualization script

document.addEventListener('DOMContentLoaded', function() {
    loadBodyMeasurements();
});

async function loadBodyMeasurements() {
    try {
        const response = await fetch('data/body_measurements.json');
        const data = await response.json();
        
        if (data.measurements && data.measurements.length > 0) {
            updateProportionsDisplay(data.measurements);
            createMeasurementCharts(data.measurements);
        }
    } catch (error) {
        console.error('Error loading body measurements:', error);
    }
}

function updateProportionsDisplay(measurements) {
    // Get latest measurement
    const latest = measurements[0];
    
    // Calculate proportions
    const shoulderWaist = (latest.measurements.shoulders.cm / latest.measurements.waist.cm).toFixed(2);
    const chestWaist = (latest.measurements.chest.cm / latest.measurements.waist.cm).toFixed(2);
    const armWaist = ((latest.measurements.leftArm.cm + latest.measurements.rightArm.cm) / 2 / latest.measurements.waist.cm).toFixed(2);
    const thighWaist = ((latest.measurements.leftThigh.cm + latest.measurements.rightThigh.cm) / 2 / latest.measurements.waist.cm).toFixed(2);
    
    // Target values
    const targets = {
        shoulderWaist: 1.35,
        chestWaist: 1.15,
        armWaist: 0.45,
        thighWaist: 0.60
    };
    
    // Update the DOM if elements exist
    const proportionsSection = document.getElementById('proportions-progress');
    if (proportionsSection) {
        proportionsSection.innerHTML = `
            <div class="muscle-item">
                <div class="muscle-name">Schulter : Taille</div>
                <div class="muscle-stats">
                    <span class="current">${shoulderWaist}</span>
                    <span class="target">${targets.shoulderWaist}</span>
                </div>
                <div class="mini-progress">
                    <div class="mini-progress-bar" style="width: ${Math.min(100, (shoulderWaist/targets.shoulderWaist*100).toFixed(0))}%;"></div>
                </div>
            </div>
            <div class="muscle-item">
                <div class="muscle-name">Brust : Taille</div>
                <div class="muscle-stats">
                    <span class="current">${chestWaist}</span>
                    <span class="target">${targets.chestWaist}</span>
                </div>
                <div class="mini-progress">
                    <div class="mini-progress-bar" style="width: ${Math.min(100, (chestWaist/targets.chestWaist*100).toFixed(0))}%;"></div>
                </div>
            </div>
            <div class="muscle-item">
                <div class="muscle-name">Arme : Taille</div>
                <div class="muscle-stats">
                    <span class="current">${armWaist}</span>
                    <span class="target">${targets.armWaist}</span>
                </div>
                <div class="mini-progress">
                    <div class="mini-progress-bar" style="width: ${Math.min(100, (armWaist/targets.armWaist*100).toFixed(0))}%;"></div>
                </div>
            </div>
            <div class="muscle-item">
                <div class="muscle-name">Oberschenkel : Taille</div>
                <div class="muscle-stats">
                    <span class="current">${thighWaist}</span>
                    <span class="target">${targets.thighWaist}</span>
                </div>
                <div class="mini-progress">
                    <div class="mini-progress-bar" style="width: ${Math.min(100, (thighWaist/targets.thighWaist*100).toFixed(0))}%;"></div>
                </div>
            </div>
        `;
    }
    
    // Add next measurement reminder
    setupMeasurementReminder();
}

function setupMeasurementReminder() {
    // Calculate next measurement date (29th of next month)
    const today = new Date();
    let nextMonth = today.getMonth() + 1;
    let nextYear = today.getFullYear();
    
    if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
    }
    
    const nextMeasurementDate = new Date(nextYear, nextMonth, 29);
    
    // Format the date
    const formattedDate = nextMeasurementDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Add reminder to events list
    const eventList = document.getElementById('event-list');
    if (eventList) {
        // Check if reminder already exists
        const existingReminders = eventList.querySelectorAll('.measurement-reminder');
        if (existingReminders.length === 0) {
            const reminderElement = document.createElement('p');
            reminderElement.className = 'measurement-reminder';
            reminderElement.innerHTML = `<strong>${formattedDate}:</strong> Monatliche Körpermessungen`;
            eventList.appendChild(reminderElement);
        }
    }
}

function createMeasurementCharts(measurements) {
    // This function can be expanded to create more advanced charts
    // For now, we'll just add a note about the latest measurement
    
    const latest = measurements[0];
    const date = latest.date;
    
    const measurementNote = document.createElement('div');
    measurementNote.className = 'measurement-note';
    measurementNote.innerHTML = `<p>Letzte Messung: ${date}</p>`;
    
    // If we have a measurements section, add the note
    const measurementsSection = document.querySelector('.card:contains("Übungsfortschritte")');
    if (measurementsSection) {
        measurementsSection.appendChild(measurementNote);
    }
}