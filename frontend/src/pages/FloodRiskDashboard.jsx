import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CloudRain,
  AlertTriangle,
  Activity,
  Layers,
  Sliders,
  TrendingUp,
  MapPin,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  Droplets,
  Search
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import RiskBadge from '../components/RiskBadge';
import { fetchAnalyticsSummary, fetchHotspots } from '../services/api';

export default function FloodRiskDashboard({ selectedCity }) {
  const [summary, setSummary] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [simulatedRainfall, setSimulatedRainfall] = useState(75);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, hotRes] = await Promise.all([
          fetchAnalyticsSummary(selectedCity),
          fetchHotspots(selectedCity, simulatedRainfall),
        ]);
        setSummary(sumRes);
        setHotspots(hotRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCity, simulatedRainfall]);

  // Risk Distribution Data for Pie Chart & Complete Severity Breakdown
  const riskCounts = {
    CRITICAL: hotspots.filter(h => h.risk_level === 'CRITICAL').length,
    HIGH: hotspots.filter(h => h.risk_level === 'HIGH').length,
    MODERATE: hotspots.filter(h => h.risk_level === 'MODERATE').length,
    LOW: hotspots.filter(h => h.risk_level === 'LOW').length,
  };

  const allSeverityCategories = [
    { name: 'Critical Inundation (FRI ≥ 80)', value: riskCounts.CRITICAL, color: '#EF4444' },
    { name: 'High Risk (FRI 60–79)', value: riskCounts.HIGH, color: '#F97316' },
    { name: 'Moderate Risk (FRI 30–59)', value: riskCounts.MODERATE, color: '#EAB308' },
    { name: 'Low Hazard (FRI < 30)', value: riskCounts.LOW, color: '#10B981' },
  ];

  const pieData = allSeverityCategories.filter(d => d.value > 0);

  // Filtered hotspots
  const filteredHotspots = hotspots.filter(h => {
    const matchesLevel = filterLevel === 'ALL' || h.risk_level === filterLevel;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.ward_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="uppercase tracking-widest font-bold">Municipal Intelligence Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {selectedCity} Flood Risk Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic urban hydrologic risk indices calculated across catchments, elevation basins & rajakaluves.
          </p>
        </div>

        {/* Standardized Simulated Rainfall Scenario Controls */}
        <div className="bg-navy-900 border border-navy-750 p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Simulation Scenario</div>
              <div className="text-sm font-mono font-bold text-white">{simulatedRainfall} mm</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="15"
              max="160"
              step="5"
              value={simulatedRainfall}
              onChange={(e) => setSimulatedRainfall(Number(e.target.value))}
              className="w-28 sm:w-36 accent-cyan-500 cursor-pointer"
            />
            <div className="flex items-center space-x-1">
              {[
                { label: '25mm', desc: 'Moderate', val: 25 },
                { label: '75mm', desc: 'Downpour', val: 75 },
                { label: '140mm', desc: 'Cloudburst', val: 140 }
              ].map(s => (
                <button
                  key={s.val}
                  onClick={() => setSimulatedRainfall(s.val)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                    simulatedRainfall === s.val
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-white'
                  }`}
                  title={`${s.desc} Scenario (${s.val}mm)`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl relative overflow-hidden">
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Critical Hotspots</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-red-400 mt-2">
            {riskCounts.CRITICAL} <span className="text-xs text-slate-500 font-normal">zones</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Immediate intervention required</div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
        </div>

        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl relative overflow-hidden">
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>City-Wide De-Watering Pumps</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-400 mt-2">
            {summary?.active_pumps_deployed || 14} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total across {summary?.total_hotspots || 5} hotspots • Deficit: {summary?.pump_capacity_deficit || 11}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
        </div>

        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl relative overflow-hidden">
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Citizen Incidents</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-2">
            {summary?.open_citizen_incidents || 4} <span className="text-xs text-slate-500 font-normal">active</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Crowdsourced verification active</div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl relative overflow-hidden">
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Mean Basin Elevation</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-teal-400 mt-2">
            {selectedCity.toLowerCase() === 'bengaluru' ? '900m' : selectedCity.toLowerCase() === 'mumbai' ? '12m' : '8m'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {selectedCity.toLowerCase() === 'bengaluru' ? 'Valley topography' : 'Coastal sea-level'}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500" />
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Rainfall Runoff Hydrograph Chart */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-750 p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Rainfall vs Storm Runoff Hydrograph (12-Hour Timeline)
              </h3>
              <p className="text-xs text-slate-400">
                Simulated precipitation accumulation versus drainage canal discharge (cusecs).
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Surcharge Peak: 16:00 IST
            </span>
          </div>

          <div className="h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.rainfall_trend || []}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="runoffGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis yAxisId="left" stroke="#06B6D4" fontSize={11} label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fill: '#06B6D4', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#EF4444" fontSize={11} label={{ value: 'Runoff (cusecs)', angle: 90, position: 'insideRight', fill: '#EF4444', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#233054', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="rainfall_mm" stroke="#06B6D4" fillOpacity={1} fill="url(#rainGrad)" name="Rainfall (mm)" />
                <Area yAxisId="right" type="monotone" dataKey="runoff_cusecs" stroke="#EF4444" fillOpacity={1} fill="url(#runoffGrad)" name="Runoff (cusecs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-750 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Hotspot Severity Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Categorization under current {simulatedRainfall}mm scenario.
            </p>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#233054', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-navy-800">
            {allSeverityCategories.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className={`font-mono font-bold ${item.value > 0 ? 'text-white' : 'text-slate-500'}`}>
                  {item.value} zones
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Ward Ranking & Hotspot Matrix Table */}
      <div className="bg-navy-900 border border-navy-750 rounded-2xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Ward-Level Flood Vulnerability Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by real-time Flood Risk Index (FRI). Click any hotspot to view topographic cross-section.
            </p>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ward or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-navy-950 border border-navy-750 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>

            <div className="flex items-center space-x-1 bg-navy-950 border border-navy-750 rounded-xl p-1 text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition ${
                    filterLevel === lvl
                      ? 'bg-cyan-500 text-navy-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-mono text-[11px] uppercase border-b border-navy-800">
              <tr>
                <th className="py-3 px-4">Hotspot & Ward</th>
                <th className="py-3 px-3">Elevation</th>
                <th className="py-3 px-3">Drain Dist</th>
                <th className="py-3 px-3">Impervious</th>
                <th className="py-3 px-3">Drain Rating</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Pumps Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredHotspots.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                    No hotspots match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredHotspots.map((h) => (
                  <tr key={h.id} className="hover:bg-navy-850/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{h.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{h.ward_name} (Ward #{h.ward_no})</div>
                    </td>
                    <td className="py-3 px-3 font-mono">{h.elevation_m}m</td>
                    <td className="py-3 px-3 font-mono">{h.water_dist_m}m</td>
                    <td className="py-3 px-3 font-mono">{Math.round(h.impervious_ratio * 100)}%</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        h.drainage_capacity_score < 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {h.drainage_capacity_score}/10
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={h.risk_level} score={h.current_risk} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={h.active_pumps < h.required_pumps ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {h.active_pumps} / {h.required_pumps}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/hotspots?id=${h.id}`}
                        className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-semibold text-xs transition"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
