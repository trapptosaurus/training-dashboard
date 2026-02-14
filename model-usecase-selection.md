# Modell-Auswahl nach Anwendungsfall

## Optimale Modelle nach Usecase

| Modell | Primärer Usecase | Stärken | Schwächen |
|--------|------------------|---------|-----------|
| **GPT-5.2** | **Best Model Allround + Kostenoptimiert** | Ausgewogene Leistung in allen Bereichen | Nicht spezialisiert für einzelne Aufgaben |
| **DeepSeek V3.2** | **Sehr billig aber stark** | Hervorragendes Preis-Leistungs-Verhältnis | Eingeschränkter Kontext |
| **Claude Sonnet 4** | **Balanced** | Ausgewogene Reasoning-Fähigkeiten | Mittlere Kosten |
| **Gemini 3 Flash** | **Super long docs** | Verarbeitet sehr große Dokumente | Höhere Kosten |

## Automatische Modellauswahl

Das System wählt basierend auf dem spezifischen Anwendungsfall automatisch das optimale Modell aus:

### 1. Tägliche Trainingspläne
- **Primär:** GPT-5.2
- **Alternativ:** Claude Sonnet 4

### 2. Datenauswertung und -verarbeitung
- **Primär:** DeepSeek V3.2
- **Alternativ:** GPT-5.2

### 3. Langfristige Trainingsanalyse
- **Primär:** Gemini 3 Flash
- **Alternativ:** GPT-5.2

### 4. Kostenoptimierte Massenanfragen
- **Primär:** DeepSeek V3.2
- **Alternativ:** Claude Sonnet 4