import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Radio,
  Layers,
  Activity,
  Sliders,
  CloudRain,
  MapPin,
  TrendingDown,
  ShieldAlert,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Building,
  LifeBuoy
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import RiskBadge from '../components/RiskBadge';
import FeatureContributionBar from '../components/FeatureContributionBar';
import { fetchHotspots, fetchHotspotDetail, updateResourceStatus, dispatchPumpToHotspot } from '../services/api';

export default function HotspotDetails({ selectedCity }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id');

  const [hotspots, setHotspots] = useState([]);
  const [currentHotspotId, setCurrentHotspotId] = useState(initialId || '');
  const [detailData, setDetailData] = useState(null);
  const [rainfallInput, setRainfallInput] = useState(75);
  const [dispatchSuccess, setDispatchSuccess] = useState(null);
  const [dispatchError, setDispatchError] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all hotspots for current city
  useEffect(() => {
    async function loadHotspots() {
      try {
        const res = await fetchHotspots(selectedCity);
        setHotspots(res);
        if (res.length > 0) {
          const matched = initialId && res.find(h => h.id === initialId);
          const targetId = matched ? initialId : res[0].id;
          setCurrentHotspotId(targetId);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadHotspots();
  }, [selectedCity, initialId]);

  // Load detail for selected hotspot
  useEffect(() => {
    if (!currentHotspotId) return;
    async function loadDetail() {
      setLoading(true);
      try {
        const res = await fetchHotspotDetail(currentHotspotId, rainfallInput);
        setDetailData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [currentHotspotId, rainfallInput]);

  const handleSelectHotspot = (id) => {
    setCurrentHotspotId(id);
    setSearchParams({ id });
    setDispatchSuccess(null);
    setDispatchError(null);
  };

  const handleQuickDispatchPump = async () => {
    if (!hotspot?.id) return;
    setDispatching(true);
    setDispatchError(null);
    try {
      const res = await dispatchPumpToHotspot(hotspot.id);
      setDispatchSuccess(res.message || `Dispatched additional de-watering pump to ${hotspot.name}`);
      // Refresh active pumps locally
      setDetailData(prev => ({
        ...prev,
        hotspot: {
          ...prev.hotspot,
          active_pumps: res.hotspot.active_pumps,
          status: res.hotspot.status
        }
      }));
      setTimeout(() => setDispatchSuccess(null), 6000);
    } catch (err) {
      setDispatchError(err.message || 'Equipment dispatch failed');
      setTimeout(() => setDispatchError(null), 6000);
    } finally {
      setDispatching(false);
    }
  };

  if (!detailData && loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
        <p className="text-sm font-mono">Loading Hydrologic Profile & DEM Elevation Models...</p>
      </div>
    );
  }

  const { hotspot, prediction, elevation_cross_section, hourly_projection } = detailData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header & Hotspot Selector Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <Radio className="w-4 h-4" />
            <span className="uppercase tracking-widest font-bold">Deep Spatial & Hydrologic Inspection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {hotspot?.name || 'Hotspot Details'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ward #{hotspot?.ward_no} • {hotspot?.ward_name} ({hotspot?.city}) • Managing Agency: BBMP / BMC / GCC
          </p>
        </div>

        {/* Hotspot Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-navy-900 border border-navy-750 px-3 py-2 rounded-xl flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-mono">Switch:</span>
            <select
              value={currentHotspotId}
              onChange={(e) => handleSelectHotspot(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-xs"
            >
              {hotspots.map((h) => (
                <option key={h.id} value={h.id} className="bg-navy-900 text-white">
                  {h.name} ({h.risk_level})
                </option>
              ))}
            </select>
          </div>

          <Link
            to={`/map`}
            className="bg-navy-850 hover:bg-navy-800 text-cyan-400 border border-navy-750 px-3 py-2 rounded-xl text-xs font-semibold transition"
          >
            Locate on Map
          </Link>
        </div>
      </div>

      {/* Top Banner Alert & Quick Scenario Slider */}
      <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <RiskBadge level={prediction?.risk_level} score={prediction?.risk_score} size="lg" />
          <div>
            <div className="text-sm font-bold text-white">{prediction?.alert_headline}</div>
            <div className="text-xs text-slate-400 font-mono">
              Inundation Probability: <strong className="text-cyan-400">{Math.round((prediction?.inundation_prob || 0) * 100)}%</strong> • Projected Water Depth: <strong className="text-amber-400">{prediction?.flood_depth_estimate_cm} cm</strong> • Stationed Pumps: <strong className="text-teal-400">{hotspot?.active_pumps || 0}/{hotspot?.required_pumps || 0} units</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Rainfall Adjuster */}
        <div className="flex items-center space-x-3 bg-navy-950 px-3 py-2 rounded-xl border border-navy-800">
          <CloudRain className="w-4 h-4 text-cyan-400" />
          <div className="text-xs font-mono">
            <span className="text-slate-400">Rainfall:</span> <strong className="text-white">{rainfallInput}mm</strong>
          </div>
          <input
            type="range"
            min="15"
            max="150"
            step="5"
            value={rainfallInput}
            onChange={(e) => setRainfallInput(Number(e.target.value))}
            className="w-24 sm:w-28 accent-cyan-500 cursor-pointer"
          />
          <div className="hidden sm:flex items-center space-x-1">
            {[
              { label: '25mm', val: 25 },
              { label: '75mm', val: 75 },
              { label: '140mm', val: 140 }
            ].map(s => (
              <button
                key={s.val}
                onClick={() => setRainfallInput(s.val)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition ${
                  rainfallInput === s.val
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Main Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Topographic Cross-Section & 6-Hour Projections */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Elevation Profile Chart */}
          <div className="bg-navy-900 border border-navy-750 p-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Micro-Topographic Elevation Cross-Section (DEM)
                </h3>
                <p className="text-xs text-slate-400">
                  Surface elevation contour (meters above MSL) revealing the natural catchment bowl.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Low Point: {hotspot?.elevation_m}m
              </span>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={elevation_cross_section || []}>
                  <defs>
                    <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={10} />
                  <YAxis domain={['auto', 'auto']} stroke="#818CF8" fontSize={11} label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft', fill: '#818CF8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#233054', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="elevation_m" stroke="#818CF8" fillOpacity={1} fill="url(#elevGrad)" name="Elevation (m)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2 bg-navy-950 p-2 rounded-lg border border-navy-800 text-center">
              ⚠️ Inflow concentrates at 0m coordinate (center bowl) where stormwater drains surcharge.
            </div>
          </div>

          {/* 6-Hour Forward Depth & Risk Projection */}
          <div className="bg-navy-900 border border-navy-750 p-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  6-Hour Forward Flood Depth & Inundation Curve
                </h3>
                <p className="text-xs text-slate-400">
                  Predicted street water accumulation (cm) under continuing meteorological loading.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Peak: +2 Hours
              </span>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourly_projection || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis yAxisId="depth" stroke="#F97316" fontSize={11} label={{ value: 'Water Depth (cm)', angle: -90, position: 'insideLeft', fill: '#F97316', fontSize: 10 }} />
                  <YAxis yAxisId="risk" orientation="right" stroke="#06B6D4" fontSize={11} label={{ value: 'Risk (FRI)', angle: 90, position: 'insideRight', fill: '#06B6D4', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#233054', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Line yAxisId="depth" type="monotone" dataKey="water_depth_cm" stroke="#F97316" strokeWidth={2.5} name="Flood Depth (cm)" />
                  <Line yAxisId="risk" type="monotone" dataKey="risk_score" stroke="#06B6D4" strokeWidth={2} strokeDasharray="4 4" name="Flood Risk Index" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical Infrastructure at Risk */}
          <div className="bg-navy-900 border border-navy-750 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3">
              Surrounding Critical Infrastructure Vulnerability
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(hotspot?.critical_infra || []).map((infra, idx) => (
                <div key={idx} className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase">Impact Zone</div>
                  <div className="font-bold text-white mt-1">{infra}</div>
                  <div className="text-[11px] text-slate-400 mt-1">High ground access needed</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Explainable AI & Action Dispatch */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Weighted Feature Contributions (MCDA) */}
          <div className="bg-navy-900 border border-navy-750 p-5 rounded-2xl">
            <FeatureContributionBar
              contributions={prediction?.feature_contributions || []}
              showHeader={true}
            />
          </div>

          {/* Municipal Mitigation & Dispatch Card */}
          <div className="bg-navy-900 border border-navy-750 p-5 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm uppercase font-mono tracking-wider">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <span>Recommended Tactical Actions</span>
            </div>

            <div className="space-y-2">
              {(prediction?.recommended_actions || []).map((action, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-navy-950 p-2.5 rounded-xl border border-navy-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-relaxed">{action}</span>
                </div>
              ))}
            </div>

            {/* Stationed Pump Allocation Status */}
            <div className="bg-navy-950 p-2.5 rounded-xl border border-navy-800 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300">Stationed at this Hotspot:</span>
              </div>
              <span className="font-mono font-bold text-cyan-300">
                {hotspot?.active_pumps || 0} / {hotspot?.required_pumps || 0} Units Deployed
              </span>
            </div>

            {/* Emergency Equipment Dispatch Button */}
            <div className="pt-2 border-t border-navy-800 space-y-2">
              {dispatchSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{dispatchSuccess}</span>
                </div>
              )}

              {dispatchError && (
                <div className="bg-red-500/20 border border-red-500/40 p-3 rounded-xl text-xs text-red-300 flex items-center space-x-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{dispatchError}</span>
                </div>
              )}

              <button
                onClick={handleQuickDispatchPump}
                disabled={dispatching}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-navy-950 font-bold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {dispatching ? (
                  <span>Mobilizing Pump via Municipal API...</span>
                ) : (
                  <>
                    <Droplets className="w-4 h-4 text-navy-950 stroke-[2.5]" />
                    <span>Dispatch Additional De-Watering Unit</span>
                  </>
                )}
              </button>
            </div>

            {/* Nearest Relief Center Contact */}
            <div className="bg-navy-850 p-3 rounded-xl border border-navy-750 text-xs space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Designated Relief Center</div>
              <div className="font-bold text-white">{hotspot?.nearest_shelter}</div>
              <div className="text-[11px] text-teal-400">Equipped with first-aid, food rations & solar backup.</div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
