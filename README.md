# PERSONAL AI TRAINING OS Dashboard

Ein interaktives Dashboard zur Visualisierung von Trainingsdaten, Fortschritten und Zyklusplanung.

## Features

- **Trainingsfortschritt & Zeitplan**: Visualisierung des Trainingsplans mit Phasen und Timeline
- **Übungsfortschritte & Ziele**: Tracking von Leistungsdaten und Zielen für Kernübungen
- **Recovery-Tracking**: Visualisierung von Whoop-Daten und Erholungsmetriken
- **Whoop API Integration**: Automatische Synchronisierung von Recovery-Daten
- **Cycle-Planung**: Übersicht über den Beast Cycle mit Injektionsplan und wichtigen Terminen
- **Mobilfreundlich**: Responsive Design für die Nutzung auf verschiedenen Geräten

## Projekt-Struktur

```
/
├── index.html             # Hauptseite des Dashboards
├── whoop-callback.html    # Callback-Seite für Whoop OAuth-Authentifizierung
├── css/
│   └── styles.css         # Styling für das Dashboard
├── js/
│   ├── dashboard.js       # JavaScript für Datenvisualisierung und Interaktion
│   ├── whoop-api.js       # Whoop API Integration und Datenverarbeitung
│   └── recovery-integration.js # Verknüpfung von Whoop-Daten mit Trainingsempfehlungen
└── data/
    └── user_data.json     # Benutzerdaten für das Dashboard (separiert für einfache Updates)
```

## Nutzung

1. Repository klonen oder herunterladen
2. `index.html` in einem modernen Browser öffnen
3. Dashboard betrachten und mit den interaktiven Elementen interagieren
4. Für Datenaktualisierungen `data/user_data.json` bearbeiten

## Daten-Update

Um die Daten zu aktualisieren, können Sie die Datei `data/user_data.json` bearbeiten. Die Struktur enthält:

- Benutzerdaten (Größe, Gewicht, Alter)
- Trainingsphasen und Timeline
- Aktuelle Leistungsdaten und Zielwerte
- Recovery-Daten
- Cycle-Plan und wichtige Termine

## Lokale Entwicklung

Für die lokale Entwicklung:

1. Einen lokalen Server starten (z.B. mit Python: `python -m http.server`)
2. Dashboard im Browser unter `http://localhost:8000` öffnen
3. Änderungen an HTML, CSS oder JavaScript vornehmen
4. Browser aktualisieren, um Änderungen zu sehen

## Deployment

Das Dashboard ist so konzipiert, dass es einfach über GitHub Pages oder andere statische Hosting-Dienste bereitgestellt werden kann.

## Technologien

- HTML5
- CSS3
- JavaScript (Vanilla, keine externen Bibliotheken)

## Datenschutz

Alle Daten werden lokal im Browser und auf GitHub gespeichert. Es werden keine externen Dienste für die Datenspeicherung verwendet.