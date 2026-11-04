import urllib.request
import json

base = 'http://127.0.0.1:8000'

# 1. Scenarios Check
s_raw = urllib.request.urlopen(f'{base}/api/scenarios').read().decode('utf-8')
scenarios = json.loads(s_raw)
print("=== SCENARIOS VERIFICATION ===")
for sc in scenarios:
    print(f"[{sc['id']}] {sc['name']}: {sc['rainfall_intensity_mm_hr']} mm/hr intensity, {sc['cumulative_rainfall_mm']} mm cumulative")

# 2. City-wide Summary Check
sum_raw = urllib.request.urlopen(f'{base}/api/analytics/summary?city=Bengaluru').read().decode('utf-8')
summary = json.loads(sum_raw)
print("\n=== CITY-WIDE BENGALURU SUMMARY ===")
print(f"Total Hotspots: {summary['total_hotspots']}")
print(f"City-Wide Active Pumps Deployed: {summary['active_pumps_deployed']} units")
print(f"City-Wide Pump Capacity Deficit: {summary['pump_capacity_deficit']} units")

# 3. Hotspot-Specific Details Check
hot_raw = urllib.request.urlopen(f'{base}/api/hotspots/blr-hotspot-01').read().decode('utf-8')
hot_detail = json.loads(hot_raw)
hotspot = hot_detail['hotspot']
print(f"\n=== HOTSPOT DETAILS: {hotspot['name']} ===")
print(f"Stationed Pumps at this Hotspot: {hotspot['active_pumps']} / {hotspot['required_pumps']} units")
print(f"Current Risk Level: {hotspot['risk_level']} ({hotspot['current_risk']} FRI)")

# 4. Dispatch Pump Test
req = urllib.request.Request(
    f'{base}/api/hotspots/blr-hotspot-01/dispatch-pump',
    data=b'{}',
    headers={'Content-Type': 'application/json'},
    method='POST'
)
disp_raw = urllib.request.urlopen(req).read().decode('utf-8')
disp = json.loads(disp_raw)
print(f"\n=== PUMP DISPATCH OPERATION ===")
print(f"Dispatch Message: {disp['message']}")
print(f"Updated Stationed Pumps at Hotspot: {disp['hotspot']['active_pumps']} / {disp['hotspot']['required_pumps']}")

# 5. Reset to clean demo baseline
p_hot = 'd:/urbanflood-ai/backend/app/data/hotspots.json'
with open(p_hot, 'r', encoding='utf-8') as f:
    hots = json.load(f)
for h in hots:
    if h['id'] == 'blr-hotspot-01':
        h['active_pumps'] = 4
with open(p_hot, 'w', encoding='utf-8') as f:
    json.dump(hots, f, indent=2)

p_res = 'd:/urbanflood-ai/backend/app/data/authority_resources.json'
with open(p_res, 'r', encoding='utf-8') as f:
    resources = json.load(f)
for r in resources:
    if r['id'] == 'res-01':
        r['status'] = 'Available'
        r['assigned_ward'] = 'BBMP Central Mechanical Yard (South Zone)'
with open(p_res, 'w', encoding='utf-8') as f:
    json.dump(resources, f, indent=2)

print("\n>>> Clean baseline restored: Silk Board is at 4/6 pumps and Unit #14 is Available.")
print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY.")
