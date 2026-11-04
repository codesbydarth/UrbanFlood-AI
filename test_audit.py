import urllib.request
import json
import os

def test_suite():
    print("=== RUNNING URBANFLOOD AI VERIFICATION TEST SUITE ===")
    
    # Test 1: Risk Engine Calculation & Feature Contributions
    from backend.app.models import FloodRiskInput
    from backend.app.risk_engine import calculate_flood_risk_index
    
    # 1.1 Normal case
    inp1 = FloodRiskInput(
        city='Bengaluru',
        rainfall_mm=65,
        elevation_m=884,
        slope_deg=0.8,
        water_dist_m=120,
        impervious_ratio=0.92,
        drainage_capacity_score=2.5,
        historical_incidents=14
    )
    pred1 = calculate_flood_risk_index(inp1)
    shap_sum = sum(c.percentage for c in pred1.feature_contributions)
    print(f"[TEST 1.1] Risk Engine Normal: Score={pred1.risk_score}, Level={pred1.risk_level}, SHAP_Sum={round(shap_sum, 1)}%")
    assert 0 <= pred1.risk_score <= 100, "Score out of range"
    assert abs(shap_sum - 100.0) < 1.0, f"SHAP sum not 100%: {shap_sum}"
    
    # 1.2 Zero rain
    inp0 = FloodRiskInput(
        city='Bengaluru',
        rainfall_mm=0,
        elevation_m=920,
        slope_deg=5.0,
        water_dist_m=800,
        impervious_ratio=0.3,
        drainage_capacity_score=8.0,
        historical_incidents=0
    )
    pred0 = calculate_flood_risk_index(inp0)
    print(f"[TEST 1.2] Risk Engine Zero Rain: Score={pred0.risk_score}, Level={pred0.risk_level}")
    assert pred0.risk_level == 'LOW', f"Expected LOW, got {pred0.risk_level}"
    
    # 1.3 Extreme cloudburst + coastal high tide
    inp_mumbai = FloodRiskInput(
        city='Mumbai',
        rainfall_mm=140,
        elevation_m=3.0,
        slope_deg=0.3,
        water_dist_m=50,
        impervious_ratio=0.98,
        drainage_capacity_score=1.0,
        historical_incidents=20,
        tide_height_m=4.8
    )
    pred_mum = calculate_flood_risk_index(inp_mumbai)
    print(f"[TEST 1.3] Extreme Coastal Cloudburst: Score={pred_mum.risk_score}, Level={pred_mum.risk_level}, Depth={pred_mum.flood_depth_estimate_cm}cm")
    assert pred_mum.risk_level == 'CRITICAL'
    assert any(c.feature == 'tide' for c in pred_mum.feature_contributions), "Coastal tide factor missing in SHAP contributions"
    
    # Test 2: Dynamic Scenario Simulation via API
    url_base = 'http://127.0.0.1:8000/api'
    req1 = urllib.request.urlopen(f"{url_base}/hotspots?city=Bengaluru&rainfall=20")
    h_low = json.loads(req1.read().decode('utf-8'))
    req2 = urllib.request.urlopen(f"{url_base}/hotspots?city=Bengaluru&rainfall=120")
    h_high = json.loads(req2.read().decode('utf-8'))
    diffs = [h2['current_risk'] - h1['current_risk'] for h1, h2 in zip(h_low, h_high)]
    avg_diff = round(sum(diffs)/len(diffs), 1)
    print(f"[TEST 2] Dynamic Scenario Check: Average Risk Jump from 20mm to 120mm = +{avg_diff} pts")
    assert all(d > 0 for d in diffs), "Scenario simulation did not increase risk scores!"

    # Test 3: Citizen Report Persistence & Authority Lifecycle
    payload = json.dumps({
        'city': 'Bengaluru',
        'location_name': 'Automated Test Location - Ring Road Choke',
        'coordinates': [12.9300, 77.6800],
        'water_depth_level': 'Waist-deep (3-4 ft)',
        'water_depth_cm': 85.0,
        'passability': 'Completely Blocked',
        'hazard_types': ['Open Manhole', 'Submerged Car'],
        'stranded_people_count': 5,
        'reporter_name': 'Test Bot',
        'notes': 'Urgent drainage rescue needed.'
    }).encode('utf-8')
    post_req = urllib.request.Request(f"{url_base}/reports", data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    created = json.loads(urllib.request.urlopen(post_req).read().decode('utf-8'))
    rep_id = created['id']
    status_created = created['verification_status']
    print(f"[TEST 3.1] Report Created via API: ID={rep_id}, Status={status_created}")
    
    # Verify in persistence file
    with open('d:/urbanflood-ai/backend/app/data/citizen_reports.json', 'r', encoding='utf-8') as f:
        stored = json.load(f)
    assert any(r['id'] == rep_id for r in stored), "Report was not persisted to disk file!"
    print("[TEST 3.2] Report verified in persistent JSON storage file")
    
    # Authority updates report status
    patch_payload = json.dumps({'status': 'Authority Dispatched', 'authority_notes': 'SDRF Crew 02 arrived on scene.'}).encode('utf-8')
    patch_req = urllib.request.Request(f"{url_base}/reports/{rep_id}/status", data=patch_payload, headers={'Content-Type': 'application/json'}, method='PATCH')
    updated = json.loads(urllib.request.urlopen(patch_req).read().decode('utf-8'))
    status_updated = updated['report']['verification_status']
    print(f"[TEST 3.3] Authority Status Update: Status={status_updated}")
    assert status_updated == 'Authority Dispatched'

    # Test 4: GeoJSON Export
    geo_res = json.loads(urllib.request.urlopen(f"{url_base}/data/export?format=geojson").read().decode('utf-8'))
    f_count = len(geo_res.get('features', []))
    print(f"[TEST 4] GeoJSON Export: Type={geo_res.get('type')}, FeatureCount={f_count}")
    assert geo_res.get('type') == 'FeatureCollection'

    # Test 5: Safe Routing Corridor Evaluation
    route_payload = json.dumps({'city': 'Bengaluru', 'start': [12.9177, 77.6238], 'end': [12.9260, 77.6835]}).encode('utf-8')
    route_req = urllib.request.Request(f"{url_base}/routes/safe-path", data=route_payload, headers={'Content-Type': 'application/json'}, method='POST')
    route_res = json.loads(urllib.request.urlopen(route_req).read().decode('utf-8'))
    print(f"[TEST 5] Safe Route Check: Status={route_res.get('status')}, Avoided={len(route_res.get('avoided_hotspots', []))}")
    
    # Test 6: Frontend - Backend proxy health check
    fe_proxy_res = json.loads(urllib.request.urlopen("http://127.0.0.1:5173/api/health").read().decode('utf-8'))
    print(f"[TEST 6] Frontend Reverse-Proxy to Backend: {fe_proxy_res.get('status')} (Engine: {fe_proxy_res.get('engine')})")
    assert fe_proxy_res.get('status') == 'healthy'

    print("=== ALL 6 AUTOMATED INTEGRATION TESTS PASSED ===")

if __name__ == '__main__':
    test_suite()
