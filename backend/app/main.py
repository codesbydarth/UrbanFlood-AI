from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any

from .models import (
    FloodRiskInput,
    RiskPrediction,
    Hotspot,
    CitizenReport,
    CitizenReportCreate,
    AuthorityResource,
    WeatherScenario
)
from .risk_engine import calculate_flood_risk_index
from .data_manager import data_manager

app = FastAPI(
    title="URBANFLOOD AI - Early Warning & Response Intelligence API",
    description="Explainable Geospatial Flood Risk Index and Emergency Response Engine for Indian Metros.",
    version="2.1.0"
)

# Enable CORS for Vite frontend (typically http://localhost:5173 or any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "URBANFLOOD AI",
        "status": "Operational",
        "mode": "Simulation / Hackathon Prototype",
        "disclaimer": "This system generates explainable risk indices using simulated hydrological proxy models for demonstration purposes.",
        "cities": ["Bengaluru", "Mumbai", "Chennai"],
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "Explainable-FRI-v2.1",
        "xgboost_ready": True,
        "active_cities": 3,
        "total_hotspots_monitored": len(data_manager.hotspots),
        "total_citizen_reports": len(data_manager.reports)
    }

@app.get("/api/cities")
def get_cities():
    return data_manager.get_cities()

@app.get("/api/scenarios", response_model=List[WeatherScenario])
def get_scenarios():
    return data_manager.get_weather_scenarios()

@app.get("/api/hotspots", response_model=List[Hotspot])
def get_hotspots(
    city: Optional[str] = Query(None, description="City name filter"),
    rainfall: Optional[float] = Query(None, description="Simulated rainfall in mm"),
    tide: Optional[float] = Query(None, description="Tidal height in meters")
):
    return data_manager.get_hotspots(city=city, scenario_rainfall=rainfall, tide_m=tide)

@app.get("/api/hotspots/{hotspot_id}")
def get_hotspot_detail(
    hotspot_id: str,
    rainfall: Optional[float] = Query(None, description="Optional override rainfall in mm")
):
    hotspot = data_manager.get_hotspot_by_id(hotspot_id)
    if not hotspot:
        raise HTTPException(status_code=404, detail="Hotspot not found")

    rain_val = rainfall if rainfall is not None else 75.0
    tide_val = 4.2 if hotspot.city.lower() in ["mumbai", "chennai"] else 0.0

    inp = FloodRiskInput(
        city=hotspot.city,
        rainfall_mm=rain_val,
        elevation_m=hotspot.elevation_m,
        slope_deg=hotspot.slope_deg,
        water_dist_m=hotspot.water_dist_m,
        impervious_ratio=hotspot.impervious_ratio,
        drainage_capacity_score=hotspot.drainage_capacity_score,
        historical_incidents=hotspot.historical_incidents,
        tide_height_m=tide_val
    )
    prediction = calculate_flood_risk_index(inp)

    # Elevation cross-section mock data for visual chart
    elev_cross_section = [
        {"distance_m": -300, "elevation_m": round(hotspot.elevation_m + 3.8, 1), "label": "Upstream Ridge"},
        {"distance_m": -150, "elevation_m": round(hotspot.elevation_m + 1.9, 1), "label": "Service Road"},
        {"distance_m": 0, "elevation_m": round(hotspot.elevation_m, 1), "label": f"{hotspot.name} (Depression)"},
        {"distance_m": 150, "elevation_m": round(hotspot.elevation_m + 1.2, 1), "label": "Drain Bund"},
        {"distance_m": 300, "elevation_m": round(hotspot.elevation_m + 2.5, 1), "label": "Downstream Rise"},
    ]

    # Hourly risk projection mock for the next 6 hours
    hourly_projection = [
        {"hour": "Now", "rainfall_mm": round(rain_val * 0.4, 1), "risk_score": round(prediction.risk_score * 0.85, 1), "water_depth_cm": round(prediction.flood_depth_estimate_cm * 0.7, 1)},
        {"hour": "+1 Hr", "rainfall_mm": round(rain_val * 0.8, 1), "risk_score": round(prediction.risk_score * 0.95, 1), "water_depth_cm": round(prediction.flood_depth_estimate_cm * 0.9, 1)},
        {"hour": "+2 Hr (Peak)", "rainfall_mm": round(rain_val, 1), "risk_score": prediction.risk_score, "water_depth_cm": prediction.flood_depth_estimate_cm},
        {"hour": "+3 Hr", "rainfall_mm": round(rain_val * 0.75, 1), "risk_score": round(prediction.risk_score * 0.92, 1), "water_depth_cm": round(prediction.flood_depth_estimate_cm * 0.85, 1)},
        {"hour": "+4 Hr", "rainfall_mm": round(rain_val * 0.5, 1), "risk_score": round(prediction.risk_score * 0.78, 1), "water_depth_cm": round(prediction.flood_depth_estimate_cm * 0.6, 1)},
        {"hour": "+6 Hr", "rainfall_mm": round(rain_val * 0.2, 1), "risk_score": round(prediction.risk_score * 0.55, 1), "water_depth_cm": round(prediction.flood_depth_estimate_cm * 0.3, 1)},
    ]

    return {
        "hotspot": hotspot,
        "prediction": prediction,
        "elevation_cross_section": elev_cross_section,
        "hourly_projection": hourly_projection
    }

@app.post("/api/hotspots/{hotspot_id}/dispatch-pump")
def dispatch_pump(
    hotspot_id: str,
    payload: Optional[Dict[str, Any]] = Body(default=None)
):
    resource_id = payload.get("resource_id") if payload else None
    try:
        res = data_manager.dispatch_pump_to_hotspot(hotspot_id, resource_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/risk/predict", response_model=RiskPrediction)
def predict_risk(input_data: FloodRiskInput):
    """
    Real-time Explainable Flood Risk Index calculation based on spatial & hydrological inputs.
    """
    return calculate_flood_risk_index(input_data)

@app.get("/api/reports", response_model=List[CitizenReport])
def get_reports(city: Optional[str] = Query(None)):
    return data_manager.get_reports(city=city)

@app.post("/api/reports", response_model=CitizenReport)
def create_report(report_in: CitizenReportCreate):
    return data_manager.add_report(report_in)

@app.post("/api/reports/{report_id}/upvote")
def upvote_report(report_id: str):
    res = data_manager.upvote_report(report_id)
    if not res:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report confirmed and upvoted", "report": res}

@app.patch("/api/reports/{report_id}/status")
def update_report_status(
    report_id: str,
    payload: Dict[str, Any] = Body(...)
):
    status = payload.get("status")
    notes = payload.get("authority_notes")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    res = data_manager.update_report_status(report_id, status, notes)
    if not res:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report status updated", "report": res}

@app.get("/api/resources", response_model=List[AuthorityResource])
def get_resources(city: Optional[str] = Query(None)):
    return data_manager.get_resources(city=city)

@app.patch("/api/resources/{resource_id}")
def update_resource(
    resource_id: str,
    payload: Dict[str, Any] = Body(...)
):
    status = payload.get("status")
    ward = payload.get("assigned_ward")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    res = data_manager.update_resource_status(resource_id, status, ward)
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource deployment updated", "resource": res}

@app.post("/api/routes/safe-path")
def safe_path(payload: Dict[str, Any] = Body(...)):
    city = payload.get("city", "Bengaluru")
    start = payload.get("start", [12.9352, 77.6245])
    end = payload.get("end", [12.9260, 77.6835])
    return data_manager.calculate_safe_route(city, start, end)

@app.get("/api/analytics/summary")
def get_analytics_summary(city: Optional[str] = Query(None)):
    hotspots = data_manager.get_hotspots(city=city)
    reports = data_manager.get_reports(city=city)
    resources = data_manager.get_resources(city=city)

    critical_count = len([h for h in hotspots if h.risk_level == "CRITICAL"])
    high_count = len([h for h in hotspots if h.risk_level == "HIGH"])
    total_pumps = sum(h.active_pumps for h in hotspots)
    required_pumps = sum(h.required_pumps for h in hotspots)
    pump_deficit = max(0, required_pumps - total_pumps)

    # Ward-level rankings
    ward_rankings = sorted(
        [{"ward": h.ward_name, "hotspot": h.name, "risk": h.current_risk, "level": h.risk_level, "pumps": h.active_pumps} for h in hotspots],
        key=lambda x: x["risk"],
        reverse=True
    )

    # Rainfall timeline simulation for past 12 hours
    rainfall_trend = [
        {"time": "08:00", "rainfall_mm": 5.2, "runoff_cusecs": 120, "alert": "Green"},
        {"time": "10:00", "rainfall_mm": 14.8, "runoff_cusecs": 350, "alert": "Yellow"},
        {"time": "12:00", "rainfall_mm": 38.6, "runoff_cusecs": 890, "alert": "Orange"},
        {"time": "14:00", "rainfall_mm": 62.1, "runoff_cusecs": 1650, "alert": "Red"},
        {"time": "16:00", "rainfall_mm": 78.4, "runoff_cusecs": 2100, "alert": "Red"},
        {"time": "18:00", "rainfall_mm": 54.0, "runoff_cusecs": 1420, "alert": "Orange"},
        {"time": "20:00", "rainfall_mm": 42.5, "runoff_cusecs": 1100, "alert": "Orange"},
    ]

    return {
        "city_filtered": city or "All Cities",
        "total_hotspots": len(hotspots),
        "critical_hotspots": critical_count,
        "high_risk_hotspots": high_count,
        "active_pumps_deployed": total_pumps,
        "pump_capacity_deficit": pump_deficit,
        "open_citizen_incidents": len([r for r in reports if r.verification_status != "Resolved"]),
        "resolved_incidents": len([r for r in reports if r.verification_status == "Resolved"]),
        "active_rescue_boats": len([res for res in resources if "Boat" in res.type and res.status in ["Dispatched", "On-Site Active"]]),
        "ward_rankings": ward_rankings,
        "rainfall_trend": rainfall_trend,
        "is_simulated": True
    }

@app.get("/api/data/export")
def export_dataset(format: str = Query("geojson")):
    """
    Export simulated hotspot geospatial layer.
    """
    features = []
    for h in data_manager.hotspots:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [h.coordinates[1], h.coordinates[0]]  # GeoJSON is [lng, lat]
            },
            "properties": {
                "id": h.id,
                "name": h.name,
                "city": h.city,
                "ward": h.ward_name,
                "risk_score": h.current_risk,
                "risk_level": h.risk_level,
                "elevation_m": h.elevation_m,
                "impervious_ratio": h.impervious_ratio,
                "active_pumps": h.active_pumps,
                "status": h.status
            }
        })

    return {
        "type": "FeatureCollection",
        "metadata": {
            "name": "UrbanFlood AI Hotspots GeoJSON Layer",
            "attribution": "UrbanFlood AI Simulation Framework",
            "generated_for": "Disaster Response & Urban Spatial Decision Support"
        },
        "features": features
    }
