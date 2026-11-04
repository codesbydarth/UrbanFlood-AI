import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Radio,
  Sliders,
  CloudRain,
  MapPin,
  AlertTriangle,
  LifeBuoy,
  ShieldAlert,
  Droplets,
  ExternalLink,
  Info,
  X,
  Compass,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FeatureContributionBar from '../components/FeatureContributionBar';
import { fetchHotspots, fetchReports, fetchResources, calculateCustomRisk } from '../services/api';

// Custom Map Panning Hook when City or Selected Hotspot Changes
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener to calculate custom flood risk at clicked point
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function InteractiveRiskMap({ selectedCity, cities }) {
  const [hotspots, setHotspots] = useState([]);
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [simulatedRain, setSimulatedRain] = useState(75);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [customPointRisk, setCustomPointRisk] = useState(null);
  const [evaluatingPoint, setEvaluatingPoint] = useState(false);
  const [loading, setLoading] = useState(true);

  // Layer Toggles
  const [layers, setLayers] = useState({
    hotspots: true,
    stormDrains: true,
    shelters: true,
    resources: true,
    citizenReports: true,
  });

  const currentCityObj = cities.find(c => c.name.toLowerCase() === selectedCity.toLowerCase()) || {
    name: selectedCity,
    center: [12.9716, 77.5946],
    zoom: 12
  };

  useEffect(() => {
    async function loadMapData() {
      setLoading(true);
      try {
        const [hotRes, repRes, resRes] = await Promise.all([
          fetchHotspots(selectedCity, simulatedRain),
          fetchReports(selectedCity),
          fetchResources(selectedCity),
        ]);
        setHotspots(hotRes);
        setReports(repRes);
        setResources(resRes);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, [selectedCity, simulatedRain]);

  // Handle map click to evaluate any coordinate
  const handleMapClick = async (latlng) => {
    setEvaluatingPoint(true);
    setSelectedHotspot(null);
    try {
      // Mock realistic topographic elevation based on city baseline
      const baseElev = selectedCity.toLowerCase() === 'bengaluru' ? 880 : selectedCity.toLowerCase() === 'mumbai' ? 4 : 3;
      const res = await calculateCustomRisk({
        city: selectedCity,
        rainfall_mm: simulatedRain,
        elevation_m: baseElev + (Math.sin(latlng.lat * 50) * 12),
        slope_deg: 0.9 + Math.abs(Math.cos(latlng.lng * 50) * 2),
        water_dist_m: 140 + Math.abs(Math.sin(latlng.lat * 100) * 400),
        impervious_ratio: 0.88,
        drainage_capacity_score: 3.2,
        historical_incidents: 6,
        tide_height_m: ['mumbai', 'chennai'].includes(selectedCity.toLowerCase()) ? 4.1 : 0.0
      });

      setCustomPointRisk({
        lat: latlng.lat,
        lng: latlng.lng,
        prediction: res
      });
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingPoint(false);
    }
  };

  // Simulated Stormwater Drain lines (Rajakaluves / primary nallahs)
  const drainCorridors = {
    bengaluru: [
      [[12.9400, 77.6000], [12.9260, 77.6250], [12.9200, 77.6500], [12.9260, 77.6835]], // Challaghatta to Bellandur
      [[12.9100, 77.6100], [12.9150, 77.6360], [12.9102, 77.7020]],                    // Madivala to Sarjapur
      [[13.0200, 77.6000], [13.0400, 77.6150], [13.0475, 77.6200]],                    // Nagavara drain
    ],
    mumbai: [
      [[19.1200, 72.8700], [19.0700, 72.8795], [19.0550, 72.8350]],                    // Mithi River
      [[19.0200, 72.8400], [19.0118, 72.8427], [19.0050, 72.8550]],                    // Dadar-Hindmata drain
    ],
    chennai: [
      [[12.9900, 80.1900], [12.9790, 80.2185], [12.9500, 80.2300]],                    // Velachery to Pallikaranai
      [[12.9300, 80.0500], [12.9125, 80.0680], [12.9600, 80.1500]],                    // Adyar river basin
    ]
  }[selectedCity.toLowerCase()] || [];

  // Custom SVG Markers
  const createCustomIcon = (color, label = '') => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #0B132B;
          box-shadow: 0 0 12px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  };

  const shelterIcon = L.divIcon({
    className: 'custom-shelter-marker',
    html: `
      <div style="background-color: #10B981; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #10B981;">
        <span style="font-size: 12px;">🏥</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const pumpIcon = L.divIcon({
    className: 'custom-pump-marker',
    html: `
      <div style="background-color: #06B6D4; width: 24px; height: 24px; border-radius: 6px; border: 2px solid #0B132B; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #06B6D4;">
        <span style="font-size: 12px;">⚙️</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const citizenIcon = L.divIcon({
    className: 'custom-citizen-marker',
    html: `
      <div style="background-color: #F97316; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #F97316;">
        <span style="font-size: 11px;">⚠️</span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  const clickedPinIcon = L.divIcon({
    className: 'clicked-pin-marker',
    html: `
      <div style="background-color: #A855F7; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px #A855F7; animation: bounce 1s infinite;">
        <span style="font-size: 13px;">📍</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  return (
    <div className="relative h-[calc(100vh-8.5rem)] w-full flex flex-col overflow-hidden bg-navy-950">
      
      {/* Map Control Bar Overlay (Top) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Simulation Slider Card */}
        <div className="pointer-events-auto bg-navy-900/90 border border-navy-750 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Scenario Precipitation</div>
              <div className="text-xs font-mono font-bold text-white">{simulatedRain} mm / 3-Hr</div>
            </div>
          </div>
          <input
            type="range"
            min="15"
            max="150"
            step="5"
            value={simulatedRain}
            onChange={(e) => setSimulatedRain(Number(e.target.value))}
            className="w-24 sm:w-28 accent-cyan-500 cursor-pointer"
          />
          <div className="hidden md:flex items-center space-x-1">
            {[
              { label: '25mm', val: 25 },
              { label: '75mm', val: 75 },
              { label: '140mm', val: 140 }
            ].map(s => (
              <button
                key={s.val}
                onClick={() => setSimulatedRain(s.val)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition ${
                  simulatedRain === s.val
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Layer Toggles Pill */}
        <div className="pointer-events-auto bg-navy-900/90 border border-navy-750 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl hidden sm:flex items-center space-x-2 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1 pl-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Layers:</span>
          </span>
          <button
            onClick={() => setLayers(l => ({ ...l, hotspots: !l.hotspots }))}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
              layers.hotspots ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-slate-500 bg-navy-950'
            }`}
          >
            Hotspots
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, stormDrains: !l.stormDrains }))}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
              layers.stormDrains ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-500 bg-navy-950'
            }`}
          >
            Storm Drains
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, resources: !l.resources }))}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
              layers.resources ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'text-slate-500 bg-navy-950'
            }`}
          >
            Pumps / Boats
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, citizenReports: !l.citizenReports }))}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
              layers.citizenReports ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-500 bg-navy-950'
            }`}
          >
            Citizen Reports
          </button>
        </div>

        {/* Right: Hint Badge */}
        <div className="pointer-events-auto bg-navy-900/90 border border-navy-750 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl text-[11px] text-slate-300 font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click anywhere on map to probe point risk</span>
        </div>

      </div>

      {/* Main Leaflet Map Container */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={currentCityObj.center}
          zoom={currentCityObj.zoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <ChangeMapView center={currentCityObj.center} zoom={currentCityObj.zoom} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Dark Basemap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-tiles"
          />

          {/* Layer 1: Stormwater Drain Network Polylines */}
          {layers.stormDrains && drainCorridors.map((lineCoords, idx) => (
            <Polyline
              key={`drain-${idx}`}
              positions={lineCoords}
              pathOptions={{
                color: '#06B6D4',
                weight: 4,
                opacity: 0.75,
                dashArray: '6, 8',
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-cyan-400">Primary Stormwater Trunk (Rajakaluve)</div>
                  <div className="text-slate-300">Outfall Corridor to Receiving Basin</div>
                  <div className="text-[10px] text-slate-400 font-mono">Discharge Capacity: 450 Cusecs</div>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Layer 2: Hotspot Inundation Radius Circles & Markers */}
          {layers.hotspots && hotspots.map((h) => {
            const isCritical = h.risk_level === 'CRITICAL';
            return (
              <React.Fragment key={h.id}>
                {/* Glowing buffer circle */}
                <Circle
                  center={h.coordinates}
                  radius={isCritical ? 550 : 350}
                  pathOptions={{
                    color: h.color,
                    fillColor: h.color,
                    fillOpacity: isCritical ? 0.25 : 0.15,
                    weight: isCritical ? 2.5 : 1.5,
                  }}
                />

                <Marker
                  position={h.coordinates}
                  icon={createCustomIcon(h.color)}
                  eventHandlers={{
                    click: () => {
                      setSelectedHotspot(h);
                      setCustomPointRisk(null);
                    }
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 min-w-[210px]">
                      <div className="flex items-center justify-between">
                        <RiskBadge level={h.risk_level} score={h.current_risk} size="sm" />
                        <span className="text-[10px] font-mono text-slate-400">Ward #{h.ward_no}</span>
                      </div>
                      <div className="font-bold text-sm text-white leading-tight">{h.name}</div>
                      <div className="text-xs text-slate-300 leading-snug">{h.description}</div>
                      <div className="pt-2 border-t border-navy-750 flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-400">{h.active_pumps}/{h.required_pumps} Pumps</span>
                        <button
                          onClick={() => setSelectedHotspot(h)}
                          className="text-cyan-300 hover:text-white underline font-semibold"
                        >
                          Deep Inspect →
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Layer 3: Relief Centers & Emergency Shelters */}
          {layers.shelters && hotspots.map((h) => (
            <Marker
              key={`shelter-${h.id}`}
              position={[h.coordinates[0] + 0.0035, h.coordinates[1] + 0.0035]}
              icon={shelterIcon}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Emergency Relief Shelter</div>
                  <div className="text-xs font-bold text-white">{h.nearest_shelter}</div>
                  <div className="text-xs text-slate-300">Food packets, first-aid, potable water standby.</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer 4: Equipment & Resources */}
          {layers.resources && resources.map((res) => (
            <Marker
              key={res.id}
              position={res.coordinates}
              icon={pumpIcon}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Municipal Emergency Asset</div>
                  <div className="font-bold text-white">{res.name}</div>
                  <div className="text-slate-300 font-mono">Type: {res.type}</div>
                  <div className="text-slate-300 font-mono">Capacity: {res.capacity}</div>
                  <div className="text-teal-400 font-mono text-[11px]">Status: {res.status}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer 5: Citizen Incident Reports */}
          {layers.citizenReports && reports.map((r) => (
            <Marker
              key={r.id}
              position={r.coordinates}
              icon={citizenIcon}
            >
              <Popup>
                <div className="p-1 space-y-1.5 text-xs max-w-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Citizen Incident</span>
                    <span className="text-[10px] text-slate-400 font-mono">+{r.upvotes} Votes</span>
                  </div>
                  <div className="font-bold text-white">{r.location_name}</div>
                  <div className="text-slate-300 font-mono">Water Depth: <strong>{r.water_depth_level}</strong> ({r.water_depth_cm}cm)</div>
                  <div className="text-slate-300">Passability: <span className="text-amber-400 font-semibold">{r.passability}</span></div>
                  {r.hazard_types && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.hazard_types.map((h, i) => (
                        <span key={i} className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 italic mt-1">{r.notes}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Layer 6: User-Clicked Probed Point */}
          {customPointRisk && (
            <Marker
              position={[customPointRisk.lat, customPointRisk.lng]}
              icon={clickedPinIcon}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">Probed Point Coordinates</div>
                  <div className="font-mono text-white text-[11px]">
                    {customPointRisk.lat.toFixed(4)}, {customPointRisk.lng.toFixed(4)}
                  </div>
                  <RiskBadge
                    level={customPointRisk.prediction.risk_level}
                    score={customPointRisk.prediction.risk_score}
                    size="sm"
                  />
                </div>
              </Popup>
            </Marker>
          )}

        </MapContainer>

        {/* Map Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-navy-900/90 border border-navy-750 backdrop-blur-md p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 hidden md:block">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1">
            Map Hydrologic Legend
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/40" />
            <span className="text-slate-300">Critical Flood Inundation (&gt;75 FRI)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-300">High Risk Waterlogging (55-75 FRI)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-cyan-400 border-t border-dashed" />
            <span className="text-slate-300">Primary Storm Drain / Rajakaluve</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">🏥</span>
            <span className="text-slate-300">Municipal Relief Shelter</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">⚙️</span>
            <span className="text-slate-300">De-Watering Pump / Boat</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">⚠️</span>
            <span className="text-slate-300">Citizen Incident Report</span>
          </div>
        </div>

      </div>

      {/* Slide-in Inspection Drawer for Selected Hotspot or Probed Point */}
      {(selectedHotspot || customPointRisk) && (
        <div className="absolute top-0 right-0 bottom-0 z-[1100] w-full sm:w-96 bg-navy-900/95 border-l border-navy-750 backdrop-blur-xl p-5 overflow-y-auto shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">
                {selectedHotspot ? 'Hotspot Inspection' : 'Custom Probed Point'}
              </h3>
            </div>
            <button
              onClick={() => {
                setSelectedHotspot(null);
                setCustomPointRisk(null);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedHotspot && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <RiskBadge level={selectedHotspot.risk_level} score={selectedHotspot.current_risk} size="sm" />
                  <span className="text-xs font-mono text-cyan-400">Ward #{selectedHotspot.ward_no}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedHotspot.name}</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedHotspot.description}
                </p>
              </div>

              {/* Geo Specs */}
              <div className="grid grid-cols-2 gap-2 bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px]">ELEVATION</span>
                  <div className="text-white font-bold">{selectedHotspot.elevation_m} m</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">SURFACE SLOPE</span>
                  <div className="text-white font-bold">{selectedHotspot.slope_deg}°</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">DRAIN DISTANCE</span>
                  <div className="text-cyan-400 font-bold">{selectedHotspot.water_dist_m} m</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">IMPERVIOUS RATIO</span>
                  <div className="text-amber-400 font-bold">{Math.round(selectedHotspot.impervious_ratio * 100)}%</div>
                </div>
              </div>

              {/* Pump status */}
              <div className="bg-navy-850 p-3 rounded-xl border border-navy-750 text-xs space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Pumping Status:</span>
                  <span className="text-cyan-400 font-bold">{selectedHotspot.active_pumps} of {selectedHotspot.required_pumps} Active</span>
                </div>
                <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${(selectedHotspot.active_pumps / selectedHotspot.required_pumps) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Nearest Shelter: <strong>{selectedHotspot.nearest_shelter}</strong>
                </div>
              </div>

              {/* Link to Full Hotspot Detail */}
              <a
                href={`/hotspots?id=${selectedHotspot.id}`}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-navy-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <span>Full Topographic Breakdown & Feature Contributions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Probed Custom Location Risk */}
          {customPointRisk && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-purple-400 mb-1">Point Spatial Analysis</div>
                <div className="text-xs font-mono text-slate-400">
                  Lat: {customPointRisk.lat.toFixed(5)}, Lng: {customPointRisk.lng.toFixed(5)}
                </div>
              </div>

              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Calculated FRI</div>
                  <div className="text-xl font-mono font-bold text-white">
                    {customPointRisk.prediction.risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
                <RiskBadge
                  level={customPointRisk.prediction.risk_level}
                  score={customPointRisk.prediction.risk_score}
                  size="md"
                />
              </div>

              {/* Explainable Feature Contributions */}
              <div className="bg-navy-850 p-3 rounded-xl border border-navy-750">
                <FeatureContributionBar
                  contributions={customPointRisk.prediction.feature_contributions}
                  showHeader={true}
                />
              </div>

              {/* Recommendations */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="font-mono text-cyan-400 font-bold uppercase text-[11px]">Recommended Mitigations:</div>
                {customPointRisk.prediction.recommended_actions.map((act, i) => (
                  <div key={i} className="flex items-start space-x-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
