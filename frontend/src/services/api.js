// API Service for URBANFLOOD AI with robust fallback handling

const API_BASE = '/api';

export const fetchCities = async () => {
  try {
    const res = await fetch(`${API_BASE}/cities`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    return await res.json();
  } catch (err) {
    console.warn('API error, using fallback city data:', err);
    return [
      {
        id: "bengaluru",
        name: "Bengaluru",
        state: "Karnataka",
        center: [12.9716, 77.5946],
        zoom: 12,
        agency: "BBMP / KSDMA",
        avg_elevation_m: 900,
        is_coastal: false,
        hotspots_count: 5,
        current_risk_index: 76.8,
        current_rainfall_mm: 68.5,
        emergency_helpline: "1533 / 080-22660000"
      },
      {
        id: "mumbai",
        name: "Mumbai",
        state: "Maharashtra",
        center: [19.0760, 72.8777],
        zoom: 12,
        agency: "BMC / MCGM Disaster Cell",
        avg_elevation_m: 12,
        is_coastal: true,
        hotspots_count: 4,
        current_risk_index: 82.4,
        current_rainfall_mm: 88.0,
        emergency_helpline: "1916 / 022-22694725"
      },
      {
        id: "chennai",
        name: "Chennai",
        state: "Tamil Nadu",
        center: [13.0827, 80.2707],
        zoom: 12,
        agency: "Greater Chennai Corporation (GCC) / TNDMA",
        avg_elevation_m: 8,
        is_coastal: true,
        hotspots_count: 3,
        current_risk_index: 74.2,
        current_rainfall_mm: 62.0,
        emergency_helpline: "1913 / 044-25619206"
      }
    ];
  }
};

export const fetchScenarios = async () => {
  try {
    const res = await fetch(`${API_BASE}/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return await res.json();
  } catch (err) {
    console.warn('Using default scenarios:', err);
    return [
      {
        id: "scen-01",
        name: "Moderate Monsoon Showers",
        description: "Scattered precipitation typical of monsoon morning.",
        rainfall_intensity_mm_hr: 12.0,
        cumulative_rainfall_mm: 25.0,
        tide_condition: "Normal Low Tide (1.2m)",
        is_cloudburst: false
      },
      {
        id: "scen-02",
        name: "Heavy Torrential Downpour",
        description: "Persistent heavy rainfall over 3 hours.",
        rainfall_intensity_mm_hr: 45.0,
        cumulative_rainfall_mm: 75.0,
        tide_condition: "Mid Tide (2.8m)",
        is_cloudburst: false
      },
      {
        id: "scen-03",
        name: "Severe Cloudburst & Extreme Inundation",
        description: "Mesoscale cloudburst exceeding 90 mm/hr.",
        rainfall_intensity_mm_hr: 95.0,
        cumulative_rainfall_mm: 145.0,
        tide_condition: "High Spring Tide Lock (+4.6m)",
        is_cloudburst: true
      }
    ];
  }
};

export const fetchHotspots = async (city = null, rainfall = null, tide = null) => {
  try {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (rainfall !== null && rainfall !== undefined) params.append('rainfall', rainfall);
    if (tide !== null && tide !== undefined) params.append('tide', tide);

    const res = await fetch(`${API_BASE}/hotspots?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch hotspots');
    return await res.json();
  } catch (err) {
    console.warn('API error fetching hotspots:', err);
    return [];
  }
};

export const fetchHotspotDetail = async (hotspotId, rainfall = null) => {
  const params = new URLSearchParams();
  if (rainfall !== null) params.append('rainfall', rainfall);
  const res = await fetch(`${API_BASE}/hotspots/${hotspotId}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch hotspot detail');
  return await res.json();
};

export const dispatchPumpToHotspot = async (hotspotId, resourceId = null) => {
  const res = await fetch(`${API_BASE}/hotspots/${hotspotId}/dispatch-pump`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource_id: resourceId }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to dispatch pump');
  }
  return await res.json();
};

export const calculateCustomRisk = async (inputData) => {
  const res = await fetch(`${API_BASE}/risk/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputData),
  });
  if (!res.ok) throw new Error('Failed to calculate risk');
  return await res.json();
};

export const fetchReports = async (city = null) => {
  try {
    const url = city ? `${API_BASE}/reports?city=${encodeURIComponent(city)}` : `${API_BASE}/reports`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  } catch (err) {
    console.warn('API error fetching reports:', err);
    return [];
  }
};

export const submitCitizenReport = async (reportData) => {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  if (!res.ok) throw new Error('Failed to submit report');
  return await res.json();
};

export const upvoteReport = async (reportId) => {
  const res = await fetch(`${API_BASE}/reports/${reportId}/upvote`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to upvote report');
  return await res.json();
};

export const updateReportStatus = async (reportId, status, authorityNotes = '') => {
  const res = await fetch(`${API_BASE}/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, authority_notes: authorityNotes }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return await res.json();
};

export const fetchResources = async (city = null) => {
  try {
    const url = city ? `${API_BASE}/resources?city=${encodeURIComponent(city)}` : `${API_BASE}/resources`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return await res.json();
  } catch (err) {
    console.warn('API error fetching resources:', err);
    return [];
  }
};

export const updateResourceStatus = async (resourceId, status, assignedWard = null) => {
  const res = await fetch(`${API_BASE}/resources/${resourceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, assigned_ward: assignedWard }),
  });
  if (!res.ok) throw new Error('Failed to update resource');
  return await res.json();
};

export const fetchAnalyticsSummary = async (city = null) => {
  try {
    const url = city ? `${API_BASE}/analytics/summary?city=${encodeURIComponent(city)}` : `${API_BASE}/analytics/summary`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    console.warn('API error fetching summary:', err);
    return null;
  }
};

export const checkSafeRoute = async (city, startCoords, endCoords) => {
  const res = await fetch(`${API_BASE}/routes/safe-path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, start: startCoords, end: endCoords }),
  });
  if (!res.ok) throw new Error('Failed to calculate safe route');
  return await res.json();
};
