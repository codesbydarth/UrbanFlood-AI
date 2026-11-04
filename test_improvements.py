import urllib.request
import json
import os

def run_tests():
    print("=== VERIFYING URBANFLOOD AI FIXES & IMPROVEMENTS ===")
    url_base = "http://127.0.0.1:8000/api"

    # TEST FIX 1: Safe route calculations across ALL 3 cities
    print("\n--- TEST FIX 1: City-Aware Safe Routing ---")
    cities_test = [
        ("Bengaluru", [12.9352, 77.6245], [12.9260, 77.6835]),
        ("Mumbai", [19.0178, 72.8478], [19.0700, 72.8795]),
        ("Chennai", [13.0418, 80.2340], [12.9790, 80.2185])
    ]
    for city_name, start_pt, dest_pt in cities_test:
        route_payload = json.dumps({"city": city_name, "start": start_pt, "end": dest_pt}).encode("utf-8")
        req = urllib.request.Request(f"{url_base}/routes/safe-path", data=route_payload, headers={"Content-Type": "application/json"}, method="POST")
        res = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))
        avoided_count = len(res.get("avoided_hotspots", []))
        print(f"[{city_name}] Status: {res.get('status')}, Hazard Level: {res.get('hazard_level')}, Avoided Hotspots: {avoided_count}")
        assert res.get("city") == city_name, f"City mismatch for {city_name}"
        assert avoided_count > 0, f"Expected avoided hotspots in {city_name}, got 0!"
    print(">>> FIX 1 PASS: All 3 cities correctly evaluate local geographic hazards.")

    # TEST FIX 2: Functional Pump Dispatch and Persistence
    print("\n--- TEST FIX 2: Functional Pump Dispatch ---")
    # Fetch initial state of hotspot
    init_req = urllib.request.urlopen(f"{url_base}/hotspots/blr-hotspot-01")
    init_data = json.loads(init_req.read().decode("utf-8"))
    initial_pumps = init_data["hotspot"]["active_pumps"]
    print(f"Initial active pumps at {init_data['hotspot']['name']}: {initial_pumps}")

    # Dispatch a pump via API
    dispatch_req = urllib.request.Request(
        f"{url_base}/hotspots/blr-hotspot-01/dispatch-pump",
        data=b"{}",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    dispatch_res = json.loads(urllib.request.urlopen(dispatch_req).read().decode("utf-8"))
    print(f"Dispatch Response: {dispatch_res.get('message')}")
    assert dispatch_res.get("success") is True, "Dispatch failed!"
    assert dispatch_res["hotspot"]["active_pumps"] == initial_pumps + 1, "Active pump count did not increment!"

    # Verify persistence by reading from backend file on disk
    with open("d:/urbanflood-ai/backend/app/data/hotspots.json", "r", encoding="utf-8") as f:
        saved_hotspots = json.load(f)
    saved_h = next(h for h in saved_hotspots if h["id"] == "blr-hotspot-01")
    print(f"Persisted active pumps in hotspots.json: {saved_h['active_pumps']}")
    assert saved_h["active_pumps"] == initial_pumps + 1, "Hotspot active_pumps was not persisted to disk!"

    # Verify assigned pump in authority_resources.json
    with open("d:/urbanflood-ai/backend/app/data/authority_resources.json", "r", encoding="utf-8") as f:
        saved_resources = json.load(f)
    assigned_pump = next(r for r in saved_resources if r["id"] == dispatch_res["resource"]["id"])
    print(f"Persisted Resource Status: {assigned_pump['name']} -> {assigned_pump['status']} ({assigned_pump['assigned_ward']})")
    assert assigned_pump["status"] == "On-Site Active"
    print(">>> FIX 2 PASS: Pump dispatch is functional, increments counter, and persists to disk.")

    # TEST FIX 3: Pydantic V2 compatibility check
    print("\n--- TEST FIX 3: Pydantic V2 Compatibility ---")
    from backend.app.models import Hotspot, CitizenReport, AuthorityResource
    assert hasattr(Hotspot, "model_dump"), "Pydantic v2 model_dump not found on Hotspot"
    assert hasattr(CitizenReport, "model_dump"), "Pydantic v2 model_dump not found on CitizenReport"
    assert hasattr(AuthorityResource, "model_dump"), "Pydantic v2 model_dump not found on AuthorityResource"
    print(">>> FIX 3 PASS: Pydantic models cleanly support model_dump() without deprecation.")

    # TEST FIX 4: Terminology and Contribution Verification
    print("\n--- TEST FIX 4: Scientific Terminology & Contribution Audit ---")
    from backend.app.models import FloodRiskInput
    from backend.app.risk_engine import calculate_flood_risk_index
    test_calc = calculate_flood_risk_index(FloodRiskInput(
        city="Bengaluru",
        rainfall_mm=70,
        elevation_m=880,
        slope_deg=1.0,
        water_dist_m=100,
        impervious_ratio=0.9,
        drainage_capacity_score=3.0,
        historical_incidents=10
    ))
    total_pct = sum(c.percentage for c in test_calc.feature_contributions)
    print(f"Normalized Weighted MCDA Contribution Sum: {round(total_pct, 1)}%")
    assert abs(total_pct - 100.0) < 1.0, "Contributions do not sum to 100%"
    print(">>> FIX 4 PASS: Weighted MCDA feature contributions are accurately labeled and sum to 100%.")

    print("\n=== ALL TEST CRITERIA PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
