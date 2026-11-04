# URBANFLOOD AI — Urban Flood Early-Warning & Response Intelligence Platform

UrbanFlood AI is an AI-assisted urban flood early-warning and disaster response intelligence prototype engineered for dense Indian metropolitan river and lake basins (**Bengaluru, Mumbai, Chennai**).

It synthesizes precipitation, micro-topography (DEM), slope gradients, water body proximity, surface imperviousness, and stormwater drainage maintenance indices to anticipate waterlogging choke points before streets submerge.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: React 18, Vite 5, Tailwind CSS
- **Routing**: React Router DOM (7 core modules)
- **Geospatial Maps**: Leaflet & React-Leaflet with custom dark high-contrast CartoDB tiles and animated radar hazard pulses
- **Data Visualizations**: Recharts (Hydrographs, Topographic cross-sections, 6-hr forward depth curves, and risk distribution donuts)
- **Icons**: Lucide React

### Backend & AI Engine
- **Framework**: FastAPI (Python 3.11), Uvicorn, Pydantic
- **Data Processing**: Pandas, NumPy, GeoJSON, JSON
- **AI / Hydrology Engine**:
  - Explainable Multi-Criteria Decision Analysis (**MCDA**) Flood Risk Index (FRI)
  - Normalized feature contributions (**Weighted MCDA Percentage Contributions**)
  - Dynamic tidal lock penalty for coastal metros (Mumbai & Chennai)
  - Modular prediction interface ready for direct XGBoost / LightGBM model swaps (`predict_xgboost_ready`) with TreeSHAP explainer

---

## 🚀 Key Modules & Pages

1. **LANDING / OVERVIEW (`/`)**:
   - Hero dashboard with real-time operational status
   - Basin surveillance snapshot for Bengaluru, Mumbai, and Chennai
   - Multi-scenario simulation triggers (Moderate Showers, Heavy Downpour, Cloudburst)
   - Dual-persona architecture breakdown (Citizens vs. Authorities)
   - Safe transit corridor check modal

2. **FLOOD RISK DASHBOARD (`/dashboard`)**:
   - City-wide rainfall accumulation and runoff hydrograph (12-hour timeline)
   - Hotspot severity distribution pie chart
   - Dynamic simulation slider (10mm to 160mm) updating all risk scores in real-time
   - Ward-level vulnerability matrix table with search and severity filters

3. **INTERACTIVE RISK MAP (`/map`)**:
   - Leaflet map with multi-layer toggles:
     - 🔴 Flood Inundation Hotspot circles (color-coded by FRI severity)
     - 🔷 Primary Stormwater Trunks / Rajakaluves / Nallah corridors
     - 🏥 Municipal Relief Centers & Emergency Shelters
     - ⚙️ De-watering Pumps & SDRF Inflatable Boat positions
     - ⚠️ Citizen waterlogging incident telemetry pins
   - **Click-to-Probe**: Click *any point on the map* to calculate instant localized flood risk with weighted feature contributions!
   - Slide-in side drawer for detailed inspection

4. **HOTSPOT DETAILS (`/hotspots`)**:
   - Micro-topographic DEM elevation cross-section showing natural saucer depression basins
   - 6-hour forward street water depth curve (cm)
   - Explainable AI feature contribution bar chart with percentage attribution
   - Critical infrastructure vulnerability audit (Metro, Underpasses, Hospitals)
   - Direct equipment reallocation dispatch trigger

5. **CITIZEN REPORTING (`/report`)**:
   - Crowdsourced incident logging form (water depth, road passability, hazards like open manholes and live wires)
   - Live community incident telemetry feed
   - "Confirm Incident" voting system to corroborate ground reports

6. **AUTHORITY RESPONSE COMMAND (`/authority`)**:
   - Real-time incident triage queue (Verify, Dispatch pump crew, Mark resolved)
   - Heavy drainage fleet and SDRF rescue boat tracking
   - CAP-compliant Emergency Broadcast SMS generator with target ward selector

7. **DATA & MODEL INFORMATION (`/model-info`)**:
   - Full mathematical breakdown of hydrologic feature weights
   - Interactive live test bench for custom parameter inference
   - Future XGBoost integration blueprint and Python contract code
   - GeoJSON dataset download endpoint

---

## ⚙️ Running Locally

### Backend
```powershell
& "D:\PythonEmbed\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`

### Frontend
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
cd frontend
npm run dev
```
- Web Application: `http://127.0.0.1:5173/`

---

## ⚠️ Prototype Transparency Notice
*This is a hackathon prototype demonstrating geospatial AI intelligence. Telemetry, rainfall accumulation, and waterlogging measurements are hydrologically calibrated simulation models designed for disaster planning and decision support.*
