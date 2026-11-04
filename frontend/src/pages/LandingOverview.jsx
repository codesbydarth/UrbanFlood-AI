import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Waves,
  ShieldAlert,
  MapPin,
  CloudRain,
  Radio,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2,
  Navigation,
  Activity,
  Layers,
  ChevronRight,
  Sliders,
  ShieldCheck,
  Eye
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import AlertBanner from '../components/AlertBanner';
import SafeRouteModal from '../components/SafeRouteModal';
import { fetchAnalyticsSummary, fetchHotspots, fetchScenarios } from '../services/api';

export default function LandingOverview({ selectedCity, onSelectCity, cities }) {
  const [summary, setSummary] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState('scen-02');
  const [safeRouteOpen, setSafeRouteOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, hotRes, scenRes] = await Promise.all([
          fetchAnalyticsSummary(selectedCity),
          fetchHotspots(selectedCity),
          fetchScenarios(),
        ]);
        setSummary(sumRes);
        setHotspots(hotRes);
        setScenarios(scenRes);
      } catch (err) {
        console.error('Error loading landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCity]);

  const criticalHotspots = hotspots.filter(h => h.risk_level === 'CRITICAL');
  const currentCityObj = cities.find(c => c.name.toLowerCase() === selectedCity.toLowerCase()) || {
    name: selectedCity,
    state: "India",
    current_risk_index: 78.4,
    current_rainfall_mm: 72.0,
    agency: "Municipal Disaster Cell"
  };

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Emergency Alert Banner */}
      <AlertBanner city={selectedCity} criticalHotspots={criticalHotspots} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Decorative Grid and Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1 rounded-full bg-navy-850 border border-cyan-500/30 text-[11px] sm:text-xs font-mono text-cyan-400 max-w-full">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
              <span>Urban Hydrologic Intelligence</span>
              <span className="text-slate-500">•</span>
              <span className="text-teal-300">Indian Metros</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Anticipate, Monitor & Triage{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                Urban Inundation
              </span>{' '}
              Before Streets Submerge.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              UrbanFlood AI synthesizes micro-topography (DEM), stormwater drainage proxies, surface imperviousness, rainfall accumulation, and crowdsourced citizen telemetry to identify waterlogging hotspots with explainable risk scores.
            </p>

            {/* Quick Action Button Group */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/map"
                className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-navy-950 font-bold px-5 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition transform hover:-translate-y-0.5"
              >
                <Radio className="w-4 h-4 stroke-[2.5]" />
                <span>Launch Live Inundation Map</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <button
                onClick={() => setSafeRouteOpen(true)}
                className="bg-navy-850 hover:bg-navy-800 text-cyan-300 border border-navy-700 hover:border-cyan-500/40 px-4 py-3 rounded-xl text-sm font-semibold flex items-center space-x-2 transition"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Safe Route Bypass</span>
              </button>

              <Link
                to="/report"
                className="bg-navy-850 hover:bg-navy-800 text-amber-300 border border-navy-700 hover:border-amber-500/40 px-4 py-3 rounded-xl text-sm font-semibold flex items-center space-x-2 transition"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Report Waterlogging</span>
              </Link>
            </div>

            {/* Hackathon Disclaimer Badge */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono pt-1">
              <span className="px-2 py-0.5 bg-navy-850 border border-navy-750 rounded text-slate-300">
                Data Notice
              </span>
              <span>Calibrated simulation based on BBMP/BMC drainage outfalls & GIS elevation models.</span>
            </div>
          </div>

          {/* Right Column: Live City Risk Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="bg-navy-900/90 border border-navy-750 p-6 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-navy-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-mono">Basin Surveillance</div>
                    <div className="text-lg font-bold text-white flex items-center space-x-2">
                      <span>{selectedCity}</span>
                      <span className="text-xs text-slate-400 font-normal">({currentCityObj.state})</span>
                    </div>
                  </div>
                </div>

                <RiskBadge
                  level={currentCityObj.current_risk_index > 75 ? 'CRITICAL' : 'HIGH'}
                  score={currentCityObj.current_risk_index}
                />
              </div>

              {/* City Hydrologic Stats */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-navy-950/70 p-3 rounded-xl border border-navy-800">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Rainfall Load</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white mt-1">
                    {currentCityObj.current_rainfall_mm || 68.5} <span className="text-xs text-slate-400 font-normal">mm</span>
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">3-Hr Accumulated</div>
                </div>

                <div className="bg-navy-950/70 p-3 rounded-xl border border-navy-800">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Critical Hotspots</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                    {criticalHotspots.length} <span className="text-xs text-slate-400 font-normal">zones</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Under Active Surveillance</div>
                </div>

                <div className="bg-navy-950/70 p-3 rounded-xl border border-navy-800">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Managing Agency</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {currentCityObj.agency}
                  </div>
                  <div className="text-[10px] text-teal-400 mt-0.5">Coordination Unit</div>
                </div>

                <div className="bg-navy-950/70 p-3 rounded-xl border border-navy-800">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Drainage Health</span>
                  </div>
                  <div className="text-xs font-bold text-amber-400 mt-1">
                    38% Surcharge
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High Runoff Ratio</div>
                </div>
              </div>

              {/* Top Hotspot Preview */}
              {criticalHotspots.length > 0 && (
                <div className="bg-navy-850/80 p-3 rounded-xl border border-red-500/30">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-red-400 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                      <span>Highest Vulnerability:</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{criticalHotspots[0].ward_name}</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {criticalHotspots[0].name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex justify-between items-center">
                    <span>{criticalHotspots[0].active_pumps} / {criticalHotspots[0].required_pumps} Pumps Active</span>
                    <Link
                      to={`/hotspots?id=${criticalHotspots[0].id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-0.5"
                    >
                      <span>Hydrologic Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between">
                <Link
                  to="/dashboard"
                  className="w-full text-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 py-2 rounded-xl text-xs font-semibold transition"
                >
                  Open Full Municipal Risk Dashboard →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* City Switcher Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 border border-navy-800 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 px-3">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Select City Basin:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  selectedCity.toLowerCase() === city.name.toLowerCase()
                    ? 'bg-cyan-500 text-navy-950 shadow-md shadow-cyan-500/30'
                    : 'bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-750'
                }`}
              >
                <span>{city.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  selectedCity.toLowerCase() === city.name.toLowerCase()
                    ? 'bg-navy-950/30 text-navy-950'
                    : 'bg-navy-900 text-cyan-400'
                }`}>
                  {city.hotspots_count} Hotspots
                </span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 px-3 font-mono">
            <span>Model: Explainable-FRI-v2.1</span>
          </div>
        </div>
      </section>

      {/* Dynamic Scenario Simulation Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900/60 border border-navy-750 p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Interactive Rainfall & Coastal Scenario Simulation
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust precipitation intensities to evaluate how stormwater networks and low-lying basins react dynamically.
              </p>
            </div>

            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg self-start">
              Active: {activeScenario?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((scen) => (
              <button
                key={scen.id}
                onClick={() => setActiveScenarioId(scen.id)}
                className={`p-4 rounded-xl border text-left transition ${
                  activeScenarioId === scen.id
                    ? 'bg-navy-850 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                    : 'bg-navy-950/60 border-navy-800 hover:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{scen.name}</span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    scen.cumulative_rainfall_mm > 90
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : scen.cumulative_rainfall_mm > 40
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {scen.cumulative_rainfall_mm} mm
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  {scen.description}
                </p>
                <div className="text-[10px] font-mono text-teal-400 flex items-center justify-between pt-1 border-t border-navy-800/80">
                  <span>Intensity: {scen.rainfall_intensity_mm_hr} mm/hr</span>
                  <span>{scen.tide_condition?.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Persona Architecture Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold mb-1">
            Built for Two Critical User Personas
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Unified Climate Intelligence from Commuters to Command Cells
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Persona 1: Citizens & Commuters */}
          <div className="bg-navy-900 border border-navy-750 p-6 rounded-2xl hover:border-cyan-500/40 transition space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">1. Citizens & Commuters</h3>
                <p className="text-xs text-slate-400 font-mono">Real-time situational awareness & crowdsourcing</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Provides actionable alerts, safe route recommendations to avoid inundated underpasses, and a verified incident reporting portal to flag submerged vehicles, open manholes, or stranded people.
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Hyperlocal flood risk check by ward / coordinates</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Safe route bypass around active waterlogging choke points</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>One-tap incident reporting with water depth level & photos</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Direct emergency helpline SOS dialer</span>
              </li>
            </ul>

            <div className="pt-2 flex gap-3">
              <Link
                to="/report"
                className="bg-navy-850 hover:bg-navy-800 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <span>Report Flood Incident</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSafeRouteOpen(true)}
                className="bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-750 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Find Safe Route
              </button>
            </div>
          </div>

          {/* Persona 2: Municipal Authorities & Disaster Management */}
          <div className="bg-navy-900 border border-navy-750 p-6 rounded-2xl hover:border-teal-500/40 transition space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">2. Municipal Authorities & SDRF</h3>
                <p className="text-xs text-slate-400 font-mono">Incident triage & emergency asset dispatch</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Equips BBMP, BMC, and GCC emergency operations centers with ward-level vulnerability rankings, live de-watering pump deployment status, and explainable feature contributions to justify resource mobilization.
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Live triage queue of citizen-submitted waterlogging reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Heavy de-watering pump & SDRF rescue boat tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Explainable Flood Risk Index (Weighted Feature Contributions)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Emergency Broadcast Alert composer (CAP protocol compliant)</span>
              </li>
            </ul>

            <div className="pt-2 flex gap-3">
              <Link
                to="/authority"
                className="bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/30 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <span>Open Command Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/hotspots"
                className="bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-750 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Hotspot Analytics
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Safe Route Modal */}
      <SafeRouteModal
        isOpen={safeRouteOpen}
        onClose={() => setSafeRouteOpen(false)}
        selectedCity={selectedCity}
      />
    </div>
  );
}
