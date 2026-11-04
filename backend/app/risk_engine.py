import math
from typing import Dict, Any, List
from .models import FloodRiskInput, RiskPrediction, FeatureContribution

def calculate_flood_risk_index(inp: FloodRiskInput) -> RiskPrediction:
    """
    Explainable Multi-Criteria Flood Risk Index (FRI) Engine.
    Combines urban hydrology principles (Rational Method runoff coefficient,
    topographic wetness deficit, drainage capacity, and coastal tidal backpressure).
    Designed to be drop-in compatible with future XGBoost model inference.
    """

    # 1. Rainfall score (0 - 100)
    # Non-linear logistic transition: typical Indian urban thresholds
    # <30mm: safe, 30-65mm: waterlogging alerts, 65-115mm: heavy flooding, >115mm: cloudburst
    if inp.rainfall_mm <= 10:
        rain_score = inp.rainfall_mm * 1.5
    elif inp.rainfall_mm <= 40:
        rain_score = 15 + (inp.rainfall_mm - 10) * 1.0  # 15 to 45
    elif inp.rainfall_mm <= 90:
        rain_score = 45 + (inp.rainfall_mm - 40) * 0.7  # 45 to 80
    else:
        rain_score = min(100.0, 80 + (inp.rainfall_mm - 90) * 0.4)

    # 2. Elevation score (0 - 100)
    # City specific elevation baselines
    city_baselines = {
        "bengaluru": {"mean": 900.0, "low": 850.0, "high": 960.0},
        "mumbai": {"mean": 12.0, "low": 2.0, "high": 35.0},
        "chennai": {"mean": 8.0, "low": 1.5, "high": 25.0},
    }
    city_key = inp.city.lower()
    baseline = city_baselines.get(city_key, {"mean": 50.0, "low": 5.0, "high": 100.0})

    # Normalized relative depression: lower elevation = higher flood risk
    elev_range = max(1.0, baseline["high"] - baseline["low"])
    elev_deficit = max(0.0, baseline["high"] - inp.elevation_m) / elev_range
    elev_score = min(100.0, max(5.0, elev_deficit * 100.0))

    # 3. Slope score (0 - 100)
    # Very flat slopes (< 1.5 deg) accumulate water. Steeper slopes (> 6 deg) drain easily.
    if inp.slope_deg <= 1.0:
        slope_score = 95.0
    elif inp.slope_deg <= 3.0:
        slope_score = 95.0 - (inp.slope_deg - 1.0) * 25.0  # 95 down to 45
    elif inp.slope_deg <= 7.0:
        slope_score = 45.0 - (inp.slope_deg - 3.0) * 7.5   # 45 down to 15
    else:
        slope_score = max(5.0, 15.0 - (inp.slope_deg - 7.0) * 1.5)

    # 4. Water Proximity score (0 - 100)
    # Proximity to lakes, primary stormwater drains (Rajakaluves / Nallahs) or rivers
    # < 100m: 90+, 100-300m: 70-90, 300-800m: 40-70, > 1500m: <20
    if inp.water_dist_m <= 100:
        water_score = 95.0 - (inp.water_dist_m / 100.0) * 10.0
    elif inp.water_dist_m <= 400:
        water_score = 85.0 - ((inp.water_dist_m - 100) / 300.0) * 35.0  # 85 to 50
    elif inp.water_dist_m <= 1200:
        water_score = 50.0 - ((inp.water_dist_m - 400) / 800.0) * 35.0  # 50 to 15
    else:
        water_score = max(5.0, 15.0 - ((inp.water_dist_m - 1200) / 1000.0) * 10.0)

    # 5. Imperviousness / Built-up area score (0 - 100)
    # Direct correlation with runoff coefficient C (0.90 for high concrete vs 0.20 for green)
    impervious_score = min(100.0, max(10.0, inp.impervious_ratio * 100.0))

    # 6. Drainage Capacity Deficit score (0 - 100)
    # Drainage capacity score is 0 to 10 (10 = pristine wide drain, 0 = silted/missing)
    drainage_deficit_score = (10.0 - min(10.0, max(0.0, inp.drainage_capacity_score))) * 10.0

    # 7. Historical Incident booster (0 - 100)
    # Recurrence weighting
    history_score = min(100.0, inp.historical_incidents * 12.5)

    # 8. Coastal Tide Backflow Penalty (for Mumbai & Chennai)
    tide_score = 0.0
    if city_key in ["mumbai", "chennai"] and inp.tide_height_m:
        if inp.tide_height_m > 4.2:
            tide_score = min(100.0, (inp.tide_height_m - 4.2) * 50.0)
        elif inp.tide_height_m > 3.5:
            tide_score = (inp.tide_height_m - 3.5) * 20.0

    # Weighted synthesis
    # Hydrological Weights
    base_weights = {
        "rainfall": 0.28,
        "elevation": 0.16,
        "slope": 0.10,
        "water_proximity": 0.16,
        "imperviousness": 0.12,
        "drainage": 0.12,
        "historical": 0.06,
    }

    if tide_score > 0:
        # Re-balance slightly to account for coastal lock
        base_weights["tide"] = 0.10
        base_weights["rainfall"] = 0.25
        base_weights["drainage"] = 0.10
        base_weights["elevation"] = 0.14
        base_weights["water_proximity"] = 0.15
        base_weights["slope"] = 0.08
        base_weights["imperviousness"] = 0.10
        base_weights["historical"] = 0.08

    scores = {
        "rainfall": (rain_score, base_weights.get("rainfall", 0.28)),
        "elevation": (elev_score, base_weights.get("elevation", 0.16)),
        "slope": (slope_score, base_weights.get("slope", 0.10)),
        "water_proximity": (water_score, base_weights.get("water_proximity", 0.16)),
        "imperviousness": (impervious_score, base_weights.get("imperviousness", 0.12)),
        "drainage": (drainage_deficit_score, base_weights.get("drainage", 0.12)),
        "historical": (history_score, base_weights.get("historical", 0.06)),
    }
    if tide_score > 0:
        scores["tide"] = (tide_score, base_weights.get("tide", 0.10))

    # Calculate overall risk score
    raw_risk = sum(sc * wt for sc, wt in scores.values())

    # Compound synergy: If heavy rain AND (low elevation OR high tide OR bad drainage), risk amplifies
    synergy_mult = 1.0
    if rain_score > 60 and (elev_score > 70 or drainage_deficit_score > 70):
        synergy_mult = 1.12
    if rain_score > 75 and water_score > 75:
        synergy_mult = max(synergy_mult, 1.18)

    final_risk = min(100.0, max(0.0, round(raw_risk * synergy_mult, 1)))

    # Determine Risk Category
    if final_risk < 30.0:
        level = "LOW"
        color = "#10B981"  # Emerald
        depth_cm = round(max(0.0, (final_risk / 30.0) * 5.0), 1)
        prob = round(final_risk / 100.0 * 0.35, 2)
        headline = "Minimal flood hazard. Normal urban drainage functioning as expected."
        actions = [
            "Maintain standard municipal surveillance.",
            "Normal traffic flow; no diversions needed.",
            "Routine catchbasin debris inspection."
        ]
    elif final_risk < 55.0:
        level = "MODERATE"
        color = "#EAB308"  # Amber
        depth_cm = round(5.0 + ((final_risk - 30.0) / 25.0) * 15.0, 1)
        prob = round(0.35 + ((final_risk - 30.0) / 25.0) * 0.30, 2)
        headline = "Ponding and localized curb overtopping likely in low-lying intersections."
        actions = [
            "Alert Ward Quick Response Team (QRT).",
            "Commuters advised to check alternate routes in underpasses.",
            "Pre-position 1 mobile trailer pump on standby."
        ]
    elif final_risk < 75.0:
        level = "HIGH"
        color = "#F97316"  # Orange
        depth_cm = round(20.0 + ((final_risk - 55.0) / 20.0) * 35.0, 1)
        prob = round(0.65 + ((final_risk - 55.0) / 20.0) * 0.22, 2)
        headline = "Significant street waterlogging; 2-wheelers and sedans severely compromised."
        actions = [
            "Deploy high-capacity de-watering pumps to primary outfalls.",
            "Issue commuter SMS advisory avoiding arterial underpasses.",
            "Deploy traffic police for waterlogged lane barricading.",
            "Activate emergency relief shelter readiness."
        ]
    else:
        level = "CRITICAL"
        color = "#EF4444"  # Red
        depth_cm = round(55.0 + ((final_risk - 75.0) / 25.0) * 75.0, 1)
        prob = round(0.88 + ((final_risk - 75.0) / 25.0) * 0.11, 2)
        headline = "Severe urban inundation imminent. Threat to ground-floor dwellings and vital utilities."
        actions = [
            "Issue Immediate Citizen Red Alert (CAP Protocol).",
            "Mobilize SDRF / NDRF motorized inflatable rescue boats.",
            "Shut down water-submerged electrical feeder transformers.",
            "Open ward relief shelters and initiate ground-floor evacuation.",
            "Deploy suction jetting machines & 250 HP diesel pumps."
        ]

    # Calculate Normalized Weighted MCDA Feature Contributions (Sum = 100%)
    total_weighted = sum(sc * wt for sc, wt in scores.values())
    if total_weighted <= 0:
        total_weighted = 1.0

    feature_metadata = {
        "rainfall": {
            "label": "Rainfall Accumulation",
            "unit": "mm",
            "val": inp.rainfall_mm,
            "desc": f"Rainfall load ({inp.rainfall_mm}mm) exerts hydraulic pressure on city storm mains."
        },
        "elevation": {
            "label": "Topographic Low-Point",
            "unit": "m",
            "val": inp.elevation_m,
            "desc": f"Elevation of {inp.elevation_m}m places this location in a natural drainage depression."
        },
        "slope": {
            "label": "Slope Flatness",
            "unit": "deg",
            "val": inp.slope_deg,
            "desc": f"Low surface gradient ({inp.slope_deg}°) severely impedes gravity runoff velocities."
        },
        "water_proximity": {
            "label": "Waterbody / Drain Proximity",
            "unit": "m",
            "val": inp.water_dist_m,
            "desc": f"{inp.water_dist_m}m to primary canal/lake bank creates high surcharge backflow potential."
        },
        "imperviousness": {
            "label": "Impervious Built-up Fraction",
            "unit": "%",
            "val": round(inp.impervious_ratio * 100, 1),
            "desc": f"{round(inp.impervious_ratio * 100)}% concrete/asphalt prevents groundwater infiltration."
        },
        "drainage": {
            "label": "Drainage Maintenance Deficit",
            "unit": "/10",
            "val": inp.drainage_capacity_score,
            "desc": f"Drainage capacity index rated {inp.drainage_capacity_score}/10."
        },
        "historical": {
            "label": "Historical Incident Frequency",
            "unit": "events",
            "val": inp.historical_incidents,
            "desc": f"{inp.historical_incidents} confirmed waterlogging events recorded in last 5 years."
        },
        "tide": {
            "label": "Tidal Outfall Lock",
            "unit": "m",
            "val": inp.tide_height_m or 0.0,
            "desc": f"Coastal sea level at {inp.tide_height_m}m blocks sea outfall flap valves."
        }
    }

    contributions: List[FeatureContribution] = []
    for k, (sc, wt) in scores.items():
        w_score = sc * wt
        pct = round((w_score / total_weighted) * 100.0, 1)
        meta = feature_metadata[k]
        contributions.append(FeatureContribution(
            feature=k,
            label=meta["label"],
            raw_value=float(meta["val"]),
            unit=meta["unit"],
            weight=round(wt, 3),
            contribution_score=round(w_score, 1),
            percentage=pct,
            description=meta["desc"]
        ))

    # Sort contributions by percentage descending
    contributions.sort(key=lambda x: x.percentage, reverse=True)

    return RiskPrediction(
        risk_score=final_risk,
        risk_level=level,
        color=color,
        flood_depth_estimate_cm=depth_cm,
        inundation_prob=prob,
        alert_headline=headline,
        feature_contributions=contributions,
        recommended_actions=actions,
        model_version="Explainable-FRI-v2.1",
        is_simulated=True
    )
