import json
import os
from typing import List, Dict, Any, Optional
from .models import Hotspot, CitizenReport, CitizenReportCreate, AuthorityResource, WeatherScenario
from .risk_engine import calculate_flood_risk_index, FloodRiskInput

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)
REPORTS_FILE = os.path.join(DATA_DIR, "citizen_reports.json")
RESOURCES_FILE = os.path.join(DATA_DIR, "authority_resources.json")
HOTSPOTS_FILE = os.path.join(DATA_DIR, "hotspots.json")

# Predefined Hotspots for Indian Cities
INITIAL_HOTSPOTS: List[Dict[str, Any]] = [
    # BENGALURU
    {
        "id": "blr-hotspot-01",
        "name": "Silk Board Junction & 100ft Road",
        "city": "Bengaluru",
        "ward_name": "Madivala / BTM Layout",
        "ward_no": "173",
        "coordinates": [12.9177, 77.6238],
        "elevation_m": 884.0,
        "slope_deg": 0.8,
        "water_dist_m": 120.0,
        "impervious_ratio": 0.92,
        "drainage_capacity_score": 2.5,
        "historical_incidents": 14,
        "baseline_risk": 78.5,
        "current_risk": 84.2,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Silk Board Metro Interchange", "Outer Ring Road Arterial", "Hosur Road Underpass"],
        "active_pumps": 3,
        "required_pumps": 6,
        "rescue_boat_standby": True,
        "status": "Alert Issued",
        "description": "Natural catchment depression where Outer Ring Road meets Hosur Road. Surcharges into Madivala lake outfall when discharge exceeds 400 cusecs.",
        "nearest_shelter": "Madivala BBMP Community Hall (Capacity: 350)",
        "last_updated": "5 mins ago"
    },
    {
        "id": "blr-hotspot-02",
        "name": "Bellandur EcoSpace & ORR IT Corridor",
        "city": "Bengaluru",
        "ward_name": "Bellandur",
        "ward_no": "150",
        "coordinates": [12.9260, 77.6835],
        "elevation_m": 868.0,
        "slope_deg": 0.6,
        "water_dist_m": 60.0,
        "impervious_ratio": 0.94,
        "drainage_capacity_score": 1.8,
        "historical_incidents": 16,
        "baseline_risk": 82.0,
        "current_risk": 89.4,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["EcoSpace SEZ Campus", "Substation 66kV", "Bellandur Main Service Road"],
        "active_pumps": 4,
        "required_pumps": 8,
        "rescue_boat_standby": True,
        "status": "Pumps Deployed",
        "description": "Bellandur lake secondary buffer encroachment zone. Surface runoff from upstream Challaghatta valley causes rapid flash ponding up to 4.5 feet.",
        "nearest_shelter": "Govt High School Bellandur (Capacity: 500)",
        "last_updated": "2 mins ago"
    },
    {
        "id": "blr-hotspot-03",
        "name": "Rainbow Drive Layout, Sarjapur Road",
        "city": "Bengaluru",
        "ward_name": "Doddakannelli",
        "ward_no": "149",
        "coordinates": [12.9102, 77.7020],
        "elevation_m": 862.0,
        "slope_deg": 1.2,
        "water_dist_m": 90.0,
        "impervious_ratio": 0.82,
        "drainage_capacity_score": 2.0,
        "historical_incidents": 12,
        "baseline_risk": 74.0,
        "current_risk": 79.5,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Gated Residential Access", "Drinking Water Borewell Headworks"],
        "active_pumps": 2,
        "required_pumps": 4,
        "rescue_boat_standby": True,
        "status": "Evacuation Standby",
        "description": "Topographical bowl adjacent to Halanayakanahalli lake overflow rajakaluve. Water ingress blocks the sole community entry/exit portal.",
        "nearest_shelter": "Doddakannelli Primary Health Center (Capacity: 200)",
        "last_updated": "8 mins ago"
    },
    {
        "id": "blr-hotspot-04",
        "name": "HSR Layout Sector 6 (Near Silk Board Lake)",
        "city": "Bengaluru",
        "ward_name": "HSR Layout",
        "ward_no": "174",
        "coordinates": [12.9150, 77.6360],
        "elevation_m": 878.0,
        "slope_deg": 1.5,
        "water_dist_m": 210.0,
        "impervious_ratio": 0.88,
        "drainage_capacity_score": 4.0,
        "historical_incidents": 9,
        "baseline_risk": 58.0,
        "current_risk": 64.2,
        "risk_level": "HIGH",
        "color": "#F97316",
        "critical_infra": ["HSR Police Station", "Sector 6 Commercial Hub"],
        "active_pumps": 1,
        "required_pumps": 3,
        "rescue_boat_standby": False,
        "status": "Alert Issued",
        "description": "Secondary storm drain backflow during continuous showers over 50mm/hr. Basements vulnerable to water entry.",
        "nearest_shelter": "BBMP Indoor Stadium HSR (Capacity: 400)",
        "last_updated": "12 mins ago"
    },
    {
        "id": "blr-hotspot-05",
        "name": "Manyata Tech Park (Gate 1 & 2)",
        "city": "Bengaluru",
        "ward_name": "Nagavara",
        "ward_no": "23",
        "coordinates": [13.0475, 77.6200],
        "elevation_m": 880.0,
        "slope_deg": 1.1,
        "water_dist_m": 180.0,
        "impervious_ratio": 0.95,
        "drainage_capacity_score": 3.8,
        "historical_incidents": 8,
        "baseline_risk": 60.5,
        "current_risk": 67.8,
        "risk_level": "HIGH",
        "color": "#F97316",
        "critical_infra": ["Manyata IT Park Entrance", "Outer Ring Road Nagavara Flyover Ramp"],
        "active_pumps": 2,
        "required_pumps": 4,
        "rescue_boat_standby": False,
        "status": "Normal Monitoring",
        "description": "Runoff from Nagavara lake feeder channels gathers near Gate 1/2 service roads during sustained downpours.",
        "nearest_shelter": "Govt High School Nagavara (Capacity: 300)",
        "last_updated": "15 mins ago"
    },

    # MUMBAI
    {
        "id": "mum-hotspot-01",
        "name": "Hindmata Cinema & Dadar TT Circle",
        "city": "Mumbai",
        "ward_name": "F/South Ward",
        "ward_no": "F/S",
        "coordinates": [19.0118, 72.8427],
        "elevation_m": 3.2,
        "slope_deg": 0.4,
        "water_dist_m": 450.0,
        "impervious_ratio": 0.98,
        "drainage_capacity_score": 3.0,
        "historical_incidents": 22,
        "baseline_risk": 86.0,
        "current_risk": 91.5,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Dr. B.R. Ambedkar Road", "KEM Hospital Approach", "Central Railway Dadar Corridor"],
        "active_pumps": 6,
        "required_pumps": 10,
        "rescue_boat_standby": True,
        "status": "Pumps Deployed",
        "description": "Historic saucer-shaped low point. Storm runoff cannot discharge when high tide exceeds 4.0 meters. Underground holding tanks currently at 72% capacity.",
        "nearest_shelter": "Dadar Municipal School Relief Hall (Capacity: 600)",
        "last_updated": "3 mins ago"
    },
    {
        "id": "mum-hotspot-02",
        "name": "Milan Subway, Santacruz",
        "city": "Mumbai",
        "ward_name": "H/East Ward",
        "ward_no": "H/E",
        "coordinates": [19.0833, 72.8436],
        "elevation_m": 2.1,
        "slope_deg": 0.3,
        "water_dist_m": 300.0,
        "impervious_ratio": 0.96,
        "drainage_capacity_score": 2.2,
        "historical_incidents": 19,
        "baseline_risk": 84.0,
        "current_risk": 88.0,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Western Express Highway Link", "Western Railway Santacruz Pass"],
        "active_pumps": 4,
        "required_pumps": 6,
        "rescue_boat_standby": False,
        "status": "Alert Issued",
        "description": "Depressed underpass connecting East and West. Fills up within 30 minutes of 50mm/hr rainfall without continuous heavy-duty pumping.",
        "nearest_shelter": "Santacruz East BMC Welfare Center (Capacity: 350)",
        "last_updated": "6 mins ago"
    },
    {
        "id": "mum-hotspot-03",
        "name": "Kurla West - LBS Marg & Mithi River Basin",
        "city": "Mumbai",
        "ward_name": "L Ward",
        "ward_no": "L",
        "coordinates": [19.0700, 72.8795],
        "elevation_m": 4.5,
        "slope_deg": 0.7,
        "water_dist_m": 80.0,
        "impervious_ratio": 0.91,
        "drainage_capacity_score": 1.9,
        "historical_incidents": 21,
        "baseline_risk": 88.0,
        "current_risk": 93.8,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Kurla Railway Station (Central/Harbour)", "LBS Marg Bus Route", "Bail Bazar Market"],
        "active_pumps": 5,
        "required_pumps": 9,
        "rescue_boat_standby": True,
        "status": "Evacuation Standby",
        "description": "Directly abutting Mithi river. Extreme vulnerability during spring high tide + heavy monsoon runoff.",
        "nearest_shelter": "Bhabha Municipal Hospital Hall Kurla (Capacity: 700)",
        "last_updated": "1 min ago"
    },
    {
        "id": "mum-hotspot-04",
        "name": "Gandhi Market, King's Circle (Matunga)",
        "city": "Mumbai",
        "ward_name": "F/North Ward",
        "ward_no": "F/N",
        "coordinates": [19.0305, 72.8580],
        "elevation_m": 3.8,
        "slope_deg": 0.5,
        "water_dist_m": 600.0,
        "impervious_ratio": 0.94,
        "drainage_capacity_score": 3.2,
        "historical_incidents": 17,
        "baseline_risk": 75.0,
        "current_risk": 81.2,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Harbour Line King's Circle Station", "Ambedkar Road Northbound Arterial"],
        "active_pumps": 3,
        "required_pumps": 5,
        "rescue_boat_standby": False,
        "status": "Alert Issued",
        "description": "Chronic water accumulation spot affecting over 500 ground-floor shops and BEST bus services.",
        "nearest_shelter": "Matunga South Municipal School (Capacity: 400)",
        "last_updated": "10 mins ago"
    },

    # CHENNAI
    {
        "id": "chn-hotspot-01",
        "name": "Velachery Residential Main & Lake Outfall",
        "city": "Chennai",
        "ward_name": "Zone 13 (Velachery)",
        "ward_no": "177",
        "coordinates": [12.9790, 80.2185],
        "elevation_m": 2.4,
        "slope_deg": 0.5,
        "water_dist_m": 110.0,
        "impervious_ratio": 0.93,
        "drainage_capacity_score": 2.1,
        "historical_incidents": 18,
        "baseline_risk": 85.0,
        "current_risk": 90.2,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Velachery MRTS Terminal", "100-Ft Bypass Road", "Grand Square Mall Substation"],
        "active_pumps": 5,
        "required_pumps": 8,
        "rescue_boat_standby": True,
        "status": "Pumps Deployed",
        "description": "Low-lying marshland reclaim zone. Surplus canal to Pallikaranai marsh suffers heavy siltation and reverse storm flow.",
        "nearest_shelter": "Velachery Govt Higher Sec School (Capacity: 550)",
        "last_updated": "4 mins ago"
    },
    {
        "id": "chn-hotspot-02",
        "name": "Mudichur / Varadharajapuram (Adyar Basin)",
        "city": "Chennai",
        "ward_name": "Zone 12 (Mudichur)",
        "ward_no": "165",
        "coordinates": [12.9125, 80.0680],
        "elevation_m": 3.5,
        "slope_deg": 0.4,
        "water_dist_m": 70.0,
        "impervious_ratio": 0.84,
        "drainage_capacity_score": 1.7,
        "historical_incidents": 20,
        "baseline_risk": 89.0,
        "current_risk": 94.6,
        "risk_level": "CRITICAL",
        "color": "#EF4444",
        "critical_infra": ["Outer Ring Road Tambaram Junction", "Adyar River Embankment"],
        "active_pumps": 6,
        "required_pumps": 10,
        "rescue_boat_standby": True,
        "status": "Evacuation Standby",
        "description": "Flash overflow zone when Chembarambakkam reservoir outflow is opened above 8,000 cusecs.",
        "nearest_shelter": "Mudichur Community Center & High School (Capacity: 800)",
        "last_updated": "2 mins ago"
    },
    {
        "id": "chn-hotspot-03",
        "name": "T. Nagar Madley Subway & Usman Road",
        "city": "Chennai",
        "ward_name": "Zone 10 (T. Nagar)",
        "ward_no": "136",
        "coordinates": [13.0418, 80.2340],
        "elevation_m": 4.2,
        "slope_deg": 0.8,
        "water_dist_m": 350.0,
        "impervious_ratio": 0.97,
        "drainage_capacity_score": 3.4,
        "historical_incidents": 15,
        "baseline_risk": 72.0,
        "current_risk": 77.8,
        "risk_level": "HIGH",
        "color": "#F97316",
        "critical_infra": ["Mambalam Railway Station Link", "Usman Road Commercial Flyover"],
        "active_pumps": 3,
        "required_pumps": 5,
        "rescue_boat_standby": False,
        "status": "Alert Issued",
        "description": "Heavy commercial roof runoff overburdens old masonry storm drains discharging toward Mambalam canal.",
        "nearest_shelter": "Corporation Community Hall, South Usman Road (Capacity: 350)",
        "last_updated": "9 mins ago"
    }
]

# Initial Sample Citizen Reports
INITIAL_CITIZEN_REPORTS: List[Dict[str, Any]] = [
    {
        "id": "rep-101",
        "timestamp": "2026-11-04 18:45 IST",
        "city": "Bengaluru",
        "location_name": "Silk Board Junction Service Road",
        "coordinates": [12.9180, 77.6245],
        "water_depth_level": "Knee-deep (1-2 ft)",
        "water_depth_cm": 42.0,
        "passability": "4-Wheelers Only",
        "hazard_types": ["Open Manhole", "Submerged Median"],
        "stranded_people_count": 4,
        "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
        "reporter_name": "Karthik R.",
        "contact_number": "+91 98450 XXXXX",
        "notes": "Open drain slab collapsed near petrol pump. 2 bikes stuck in water. Avoid taking left turn to BTM.",
        "verification_status": "Official Verified",
        "upvotes": 14,
        "authority_notes": "BBMP Pump Crew 03 dispatched. Traffic police placing orange cones."
    },
    {
        "id": "rep-102",
        "timestamp": "2026-11-04 19:10 IST",
        "city": "Bengaluru",
        "location_name": "EcoSpace ORR Main Gate Underpass",
        "coordinates": [12.9265, 77.6840],
        "water_depth_level": "Waist-deep (3-4 ft)",
        "water_depth_cm": 95.0,
        "passability": "Completely Blocked",
        "hazard_types": ["Floating Debris", "Live Electric Wire Standby"],
        "stranded_people_count": 12,
        "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
        "reporter_name": "Priyanka S.",
        "contact_number": "+91 97412 XXXXX",
        "notes": "Water reached car windows. Office bus cannot move. Need tractor / rescue boat to evacuate tech workers.",
        "verification_status": "Authority Dispatched",
        "upvotes": 29,
        "authority_notes": "SDRF inflatable boat and 100 HP diesel pump en route from Marathahalli fire station."
    },
    {
        "id": "rep-103",
        "timestamp": "2026-11-04 19:18 IST",
        "city": "Mumbai",
        "location_name": "Hindmata Cinema Ambedkar Road",
        "coordinates": [19.0125, 72.8430],
        "water_depth_level": "Knee-deep (1-2 ft)",
        "water_depth_cm": 50.0,
        "passability": "Heavy Vehicles Only",
        "hazard_types": ["Submerged Car", "Open Manhole"],
        "stranded_people_count": 6,
        "image_url": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80",
        "reporter_name": "Amit Deshmukh",
        "contact_number": "+91 98201 XXXXX",
        "notes": "BEST buses are being diverted via Dadar TT flyover. Water entering lower steps of shops.",
        "verification_status": "Official Verified",
        "upvotes": 19,
        "authority_notes": "All 4 BMC submersible pumps running at 100% load."
    },
    {
        "id": "rep-104",
        "timestamp": "2026-11-04 19:22 IST",
        "city": "Chennai",
        "location_name": "Velachery 100-Ft Bypass Road",
        "coordinates": [12.9802, 80.2190],
        "water_depth_level": "Ankle-deep (< 6 in)",
        "water_depth_cm": 15.0,
        "passability": "Passable (All)",
        "hazard_types": ["Potholes"],
        "stranded_people_count": 0,
        "image_url": None,
        "reporter_name": "S. Sundaram",
        "contact_number": "+91 94440 XXXXX",
        "notes": "Slow traffic movement due to roadside water buildup near fuel station.",
        "verification_status": "Community Verified",
        "upvotes": 7,
        "authority_notes": "Zone 13 desilting gang notified."
    }
]

# Initial Authority Resources
INITIAL_RESOURCES: List[Dict[str, Any]] = [
    {
        "id": "res-01",
        "name": "Heavy-Duty Diesel Pump Unit #14",
        "type": "High-Capacity De-Watering Pump",
        "city": "Bengaluru",
        "assigned_ward": "Bellandur (Ward 150)",
        "status": "On-Site Active",
        "capacity": "250 HP / 8000 LPM",
        "coordinates": [12.9255, 77.6830],
        "contact_person": "Inspector Nagaraj (+91 94808 00014)"
    },
    {
        "id": "res-02",
        "name": "SDRF Rescue Boat Team Alpha",
        "type": "SDRF Rescue Inflatable Boat",
        "city": "Bengaluru",
        "assigned_ward": "Madivala / Silk Board",
        "status": "Dispatched",
        "capacity": "12 Persons / Outboard Motor",
        "coordinates": [12.9170, 77.6230],
        "contact_person": "Sub-Officer Raghavan (+91 94808 00022)"
    },
    {
        "id": "res-03",
        "name": "Suction Jetting Machine Unit 7",
        "type": "Suction Jetting Machine",
        "city": "Bengaluru",
        "assigned_ward": "HSR Layout (Ward 174)",
        "status": "Available",
        "capacity": "6000L Sludge Chamber",
        "coordinates": [12.9130, 77.6380],
        "contact_person": "Operator Manjunath (+91 94808 00035)"
    },
    {
        "id": "res-04",
        "name": "BMC Dewatering Super-Pump B-02",
        "type": "High-Capacity De-Watering Pump",
        "city": "Mumbai",
        "assigned_ward": "F/South (Hindmata)",
        "status": "On-Site Active",
        "capacity": "300 HP / 12,000 LPM",
        "coordinates": [19.0115, 72.8420],
        "contact_person": "Engineer Shinde (+91 98200 11102)"
    },
    {
        "id": "res-05",
        "name": "NDRF Quick Inundation Evacuation Unit 4",
        "type": "SDRF Rescue Inflatable Boat",
        "city": "Mumbai",
        "assigned_ward": "L Ward (Kurla Mithi Basin)",
        "status": "On-Site Active",
        "capacity": "15 Persons / Motorized",
        "coordinates": [19.0690, 72.8785],
        "contact_person": "Commandant Yadav (+91 98200 44404)"
    },
    {
        "id": "res-06",
        "name": "GCC Zone 13 Mobile Dewatering Trailer",
        "type": "High-Capacity De-Watering Pump",
        "city": "Chennai",
        "assigned_ward": "Zone 13 (Velachery)",
        "status": "On-Site Active",
        "capacity": "200 HP / 6500 LPM",
        "coordinates": [12.9785, 80.2180],
        "contact_person": "AE Srinivasan (+91 94451 90013)"
    }
]

# Scenarios available for dynamic simulation
WEATHER_SCENARIOS: List[WeatherScenario] = [
    WeatherScenario(
        id="scen-01",
        name="Moderate Monsoon Showers",
        description="Scattered precipitation typical of monsoon morning. Inundation contained to shallow curb ponding.",
        city="All",
        rainfall_intensity_mm_hr=15.0,
        cumulative_rainfall_mm=25.0,
        tide_condition="Normal Low Tide (1.2m)",
        is_cloudburst=False,
        icon="CloudRain"
    ),
    WeatherScenario(
        id="scen-02",
        name="Heavy Torrential Downpour",
        description="Persistent heavy rainfall over 3 hours. Rapid runoff overwhelms secondary rajakaluves & storm networks.",
        city="All",
        rainfall_intensity_mm_hr=45.0,
        cumulative_rainfall_mm=75.0,
        tide_condition="Mid Tide (2.8m)",
        is_cloudburst=False,
        icon="CloudLightning"
    ),
    WeatherScenario(
        id="scen-03",
        name="Severe Cloudburst & Extreme Inundation",
        description="Mesoscale cloudburst exceeding 90 mm/hr. Severe flash flooding, road blockades, and utility shutdowns.",
        city="All",
        rainfall_intensity_mm_hr=90.0,
        cumulative_rainfall_mm=140.0,
        tide_condition="High Spring Tide Lock (+4.6m)",
        is_cloudburst=True,
        icon="AlertTriangle"
    ),
    WeatherScenario(
        id="scen-04",
        name="Spring High Tide Backflow Lock",
        description="Specific to coastal cities (Mumbai / Chennai). High astronomical tide prevents stormwater outfall discharge.",
        city="Coastal",
        rainfall_intensity_mm_hr=50.0,
        cumulative_rainfall_mm=85.0,
        tide_condition="Peak Spring High Tide (+5.1m)",
        is_cloudburst=False,
        icon="Waves"
    )
]

class DataManager:
    def __init__(self):
        self._load_hotspots()
        self._load_reports()
        self._load_resources()

    def _load_hotspots(self):
        if os.path.exists(HOTSPOTS_FILE):
            try:
                with open(HOTSPOTS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.hotspots = [Hotspot(**h) for h in data]
                    return
            except Exception:
                pass
        self.hotspots = [Hotspot(**h) for h in INITIAL_HOTSPOTS]
        self._save_hotspots()

    def _save_hotspots(self):
        with open(HOTSPOTS_FILE, "w", encoding="utf-8") as f:
            json.dump([h.model_dump() for h in self.hotspots], f, indent=2)

    def _load_reports(self):
        if os.path.exists(REPORTS_FILE):
            try:
                with open(REPORTS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.reports = [CitizenReport(**r) for r in data]
                    return
            except Exception:
                pass
        self.reports = [CitizenReport(**r) for r in INITIAL_CITIZEN_REPORTS]
        self._save_reports()

    def _save_reports(self):
        with open(REPORTS_FILE, "w", encoding="utf-8") as f:
            json.dump([r.model_dump() for r in self.reports], f, indent=2)

    def _load_resources(self):
        if os.path.exists(RESOURCES_FILE):
            try:
                with open(RESOURCES_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.resources = [AuthorityResource(**r) for r in data]
                    return
            except Exception:
                pass
        self.resources = [AuthorityResource(**r) for r in INITIAL_RESOURCES]
        self._save_resources()

    def _save_resources(self):
        with open(RESOURCES_FILE, "w", encoding="utf-8") as f:
            json.dump([r.model_dump() for r in self.resources], f, indent=2)

    def get_cities(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "bengaluru",
                "name": "Bengaluru",
                "state": "Karnataka",
                "center": [12.9716, 77.5946],
                "zoom": 12,
                "agency": "BBMP / KSDMA",
                "avg_elevation_m": 900,
                "is_coastal": False,
                "hotspots_count": len([h for h in self.hotspots if h.city == "Bengaluru"]),
                "current_risk_index": 76.8,
                "current_rainfall_mm": 68.5,
                "emergency_helpline": "1533 / 080-22660000"
            },
            {
                "id": "mumbai",
                "name": "Mumbai",
                "state": "Maharashtra",
                "center": [19.0760, 72.8777],
                "zoom": 12,
                "agency": "BMC / MCGM Disaster Cell",
                "avg_elevation_m": 12,
                "is_coastal": True,
                "hotspots_count": len([h for h in self.hotspots if h.city == "Mumbai"]),
                "current_risk_index": 82.4,
                "current_rainfall_mm": 88.0,
                "emergency_helpline": "1916 / 022-22694725"
            },
            {
                "id": "chennai",
                "name": "Chennai",
                "state": "Tamil Nadu",
                "center": [13.0827, 80.2707],
                "zoom": 12,
                "agency": "Greater Chennai Corporation (GCC) / TNDMA",
                "avg_elevation_m": 8,
                "is_coastal": True,
                "hotspots_count": len([h for h in self.hotspots if h.city == "Chennai"]),
                "current_risk_index": 74.2,
                "current_rainfall_mm": 62.0,
                "emergency_helpline": "1913 / 044-25619206"
            }
        ]

    def get_hotspots(self, city: Optional[str] = None, scenario_rainfall: Optional[float] = None, tide_m: Optional[float] = None) -> List[Hotspot]:
        self._load_hotspots()
        results = []
        for h in self.hotspots:
            if city and h.city.lower() != city.lower():
                continue

            # Recalculate dynamic risk if scenario rainfall provided
            if scenario_rainfall is not None:
                inp = FloodRiskInput(
                    city=h.city,
                    rainfall_mm=scenario_rainfall,
                    elevation_m=h.elevation_m,
                    slope_deg=h.slope_deg,
                    water_dist_m=h.water_dist_m,
                    impervious_ratio=h.impervious_ratio,
                    drainage_capacity_score=h.drainage_capacity_score,
                    historical_incidents=h.historical_incidents,
                    tide_height_m=tide_m if tide_m is not None else (4.2 if h.city.lower() in ["mumbai", "chennai"] else 0.0)
                )
                pred = calculate_flood_risk_index(inp)
                h_copy = h.copy()
                h_copy.current_risk = pred.risk_score
                h_copy.risk_level = pred.risk_level
                h_copy.color = pred.color
                results.append(h_copy)
            else:
                results.append(h)
        return results

    def get_hotspot_by_id(self, hotspot_id: str) -> Optional[Hotspot]:
        self._load_hotspots()
        for h in self.hotspots:
            if h.id == hotspot_id:
                return h
        return None

    def get_reports(self, city: Optional[str] = None) -> List[CitizenReport]:
        self._load_reports()
        if city:
            return [r for r in self.reports if r.city.lower() == city.lower()]
        return self.reports

    def add_report(self, r_in: CitizenReportCreate) -> CitizenReport:
        import uuid
        from datetime import datetime

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M IST")
        new_id = f"rep-{str(uuid.uuid4())[:8]}"

        report = CitizenReport(
            id=new_id,
            timestamp=now_str,
            city=r_in.city,
            location_name=r_in.location_name,
            coordinates=r_in.coordinates,
            water_depth_level=r_in.water_depth_level,
            water_depth_cm=r_in.water_depth_cm,
            passability=r_in.passability,
            hazard_types=r_in.hazard_types,
            stranded_people_count=r_in.stranded_people_count,
            image_url=r_in.image_url,
            reporter_name=r_in.reporter_name or "Anonymous Resident",
            contact_number=r_in.contact_number,
            notes=r_in.notes or "",
            verification_status="Community Verified",
            upvotes=1,
            authority_notes="Report logged in municipal incident queue."
        )

        # Prepend so newest is first
        self.reports.insert(0, report)
        self._save_reports()
        return report

    def update_report_status(self, report_id: str, status: str, notes: Optional[str] = None) -> Optional[CitizenReport]:
        for r in self.reports:
            if r.id == report_id:
                r.verification_status = status
                if notes:
                    r.authority_notes = notes
                self._save_reports()
                return r
        return None

    def upvote_report(self, report_id: str) -> Optional[CitizenReport]:
        for r in self.reports:
            if r.id == report_id:
                r.upvotes += 1
                if r.upvotes >= 5 and r.verification_status == "Unverified":
                    r.verification_status = "Community Verified"
                self._save_reports()
                return r
        return None

    def get_resources(self, city: Optional[str] = None) -> List[AuthorityResource]:
        self._load_resources()
        if city:
            return [res for res in self.resources if res.city.lower() == city.lower()]
        return self.resources

    def update_resource_status(self, res_id: str, new_status: str, assigned_ward: Optional[str] = None) -> Optional[AuthorityResource]:
        for res in self.resources:
            if res.id == res_id:
                res.status = new_status
                if assigned_ward:
                    res.assigned_ward = assigned_ward
                self._save_resources()
                return res
        return None

    def dispatch_pump_to_hotspot(self, hotspot_id: str, resource_id: Optional[str] = None) -> Dict[str, Any]:
        hotspot = self.get_hotspot_by_id(hotspot_id)
        if not hotspot:
            raise ValueError(f"Hotspot '{hotspot_id}' not found.")

        # Find a suitable pump for this city
        pump = None
        if resource_id:
            for r in self.resources:
                if r.id == resource_id:
                    pump = r
                    break
        else:
            # First search for available pump in same city
            for r in self.resources:
                if r.city.lower() == hotspot.city.lower() and "Pump" in r.type and r.status == "Available":
                    pump = r
                    break
            # If none strictly Available, search for any pump in same city
            if not pump:
                for r in self.resources:
                    if r.city.lower() == hotspot.city.lower() and "Pump" in r.type:
                        pump = r
                        break

        if not pump:
            raise ValueError(f"No de-watering pumps currently registered for {hotspot.city} basin.")

        # Update pump status and location
        pump.status = "On-Site Active"
        pump.assigned_ward = f"{hotspot.ward_name} ({hotspot.name})"
        pump.coordinates = [round(hotspot.coordinates[0] - 0.0012, 4), round(hotspot.coordinates[1] - 0.0012, 4)]
        self._save_resources()

        # Update hotspot active pump counter and persist
        hotspot.active_pumps += 1
        if hotspot.active_pumps >= hotspot.required_pumps and hotspot.status in ["Alert Issued", "Normal Monitoring"]:
            hotspot.status = "Pumps Deployed"
        self._save_hotspots()

        return {
            "success": True,
            "message": f"Successfully mobilized {pump.name} to {hotspot.name}. Active pumps: {hotspot.active_pumps}/{hotspot.required_pumps}.",
            "resource": pump,
            "hotspot": hotspot
        }

    def get_weather_scenarios(self) -> List[WeatherScenario]:
        return WEATHER_SCENARIOS

    def calculate_safe_route(self, city: str, start_coords: List[float], end_coords: List[float]) -> Dict[str, Any]:
        """
        Calculates safe path proxy by checking spatial buffer around known hotspots.
        """
        import math

        city_hotspots = [h for h in self.hotspots if h.city.lower() == city.lower()]
        hazard_checkpoints = []

        # Find any hotspot within proximity of line segment
        def dist_km(lat1, lon1, lat2, lon2):
            R = 6371.0
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return R * c

        for h in city_hotspots:
            d_start = dist_km(start_coords[0], start_coords[1], h.coordinates[0], h.coordinates[1])
            d_end = dist_km(end_coords[0], end_coords[1], h.coordinates[0], h.coordinates[1])
            if (d_start < 2.5 or d_end < 2.5) and h.current_risk > 70:
                hazard_checkpoints.append({
                    "hotspot_name": h.name,
                    "risk_level": h.risk_level,
                    "risk_score": h.current_risk,
                    "advisory": f"Severe waterlogging hazard near {h.name}. Pumping operations ongoing."
                })

        is_compromised = len(hazard_checkpoints) > 0
        recommended_detour = "Route diverted via elevated arterial corridor away from valley basins." if is_compromised else "Direct transit corridor is clear and safe."

        return {
            "city": city,
            "status": "Diverted (Flood Bypass)" if is_compromised else "Clear Route",
            "hazard_level": "HIGH HAZARD" if is_compromised else "LOW HAZARD",
            "avoided_hotspots": hazard_checkpoints,
            "detour_summary": recommended_detour,
            "estimated_delay_mins": 25 if is_compromised else 0,
            "is_simulated": True
        }

# Global instance
data_manager = DataManager()
