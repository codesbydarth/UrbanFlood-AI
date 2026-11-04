from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FloodRiskInput(BaseModel):
    city: str = Field(default="Bengaluru", description="Target city")
    rainfall_mm: float = Field(..., ge=0, le=500, description="Rainfall accumulation in mm")
    elevation_m: float = Field(..., description="Topographic elevation in meters")
    slope_deg: float = Field(..., ge=0, le=90, description="Surface slope in degrees")
    water_dist_m: float = Field(..., ge=0, description="Distance to nearest water body/drain in meters")
    impervious_ratio: float = Field(..., ge=0, le=1.0, description="Built-up / concrete surface fraction (0-1)")
    drainage_capacity_score: float = Field(..., ge=0, le=10, description="Stormwater drainage capacity index (0-10)")
    historical_incidents: int = Field(default=0, ge=0, description="Number of past waterlogging events recorded")
    tide_height_m: Optional[float] = Field(default=0.0, ge=0, le=6.0, description="Tidal height in meters for coastal cities")

class FeatureContribution(BaseModel):
    feature: str
    label: str
    raw_value: float
    unit: str
    weight: float
    contribution_score: float
    percentage: float
    description: str

class RiskPrediction(BaseModel):
    risk_score: float
    risk_level: str  # "LOW", "MODERATE", "HIGH", "CRITICAL"
    color: str
    flood_depth_estimate_cm: float
    inundation_prob: float
    alert_headline: str
    feature_contributions: List[FeatureContribution]
    recommended_actions: List[str]
    model_version: str = "Explainable-FRI-v2.1"
    is_simulated: bool = True

class Hotspot(BaseModel):
    id: str
    name: str
    city: str
    ward_name: str
    ward_no: str
    coordinates: List[float]  # [lat, lng]
    elevation_m: float
    slope_deg: float
    water_dist_m: float
    impervious_ratio: float
    drainage_capacity_score: float
    historical_incidents: int
    baseline_risk: float
    current_risk: float
    risk_level: str
    color: str
    critical_infra: List[str]
    active_pumps: int
    required_pumps: int
    rescue_boat_standby: bool
    status: str  # "Normal Monitoring", "Alert Issued", "Pumps Deployed", "Evacuation Standby"
    description: str
    nearest_shelter: str
    last_updated: str

class CitizenReportCreate(BaseModel):
    city: str
    location_name: str
    coordinates: List[float]
    water_depth_level: str  # "Ankle-deep (< 6 in)", "Knee-deep (1-2 ft)", "Waist-deep (3-4 ft)", "Submerged (> 4 ft)"
    water_depth_cm: float
    passability: str  # "Passable (All)", "4-Wheelers Only", "Heavy Vehicles Only", "Completely Blocked"
    hazard_types: List[str]
    stranded_people_count: int = 0
    image_url: Optional[str] = None
    reporter_name: str = "Anonymous Resident"
    contact_number: Optional[str] = None
    notes: Optional[str] = ""

class CitizenReport(BaseModel):
    id: str
    timestamp: str
    city: str
    location_name: str
    coordinates: List[float]
    water_depth_level: str
    water_depth_cm: float
    passability: str
    hazard_types: List[str]
    stranded_people_count: int
    image_url: Optional[str]
    reporter_name: str
    contact_number: Optional[str]
    notes: Optional[str]
    verification_status: str  # "Unverified", "Community Verified", "Authority Dispatched", "Resolved"
    upvotes: int = 1
    authority_notes: Optional[str] = None

class AuthorityResource(BaseModel):
    id: str
    name: str
    type: str
    city: str
    assigned_ward: str
    status: str  # "Available", "Dispatched", "On-Site Active", "Maintenance"
    capacity: str
    coordinates: List[float]
    contact_person: str

class WeatherScenario(BaseModel):
    id: str
    name: str
    description: str
    city: str
    rainfall_intensity_mm_hr: float
    cumulative_rainfall_mm: float
    tide_condition: str
    is_cloudburst: bool
    icon: str
