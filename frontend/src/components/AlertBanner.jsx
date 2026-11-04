import React from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlertBanner({ city, criticalHotspots = [] }) {
  if (!criticalHotspots || criticalHotspots.length === 0) {
    return (
      <div className="bg-emerald-950/40 border-y border-emerald-800/40 px-4 py-2.5 text-xs text-emerald-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Drainage capacity normal across {city}. No critical flash flooding triggers currently active.</span>
        </div>
        <Link to="/map" className="font-medium hover:underline text-emerald-400 flex items-center">
          <span>View Map</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  const topHotspot = criticalHotspots[0];

  return (
    <div className="bg-red-950/60 border-y border-red-800/50 px-4 py-2 text-xs text-red-200 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 bg-red-500/20 rounded-md border border-red-500/30 text-red-400 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-red-400 mr-2 uppercase tracking-wider font-mono">
              [CRITICAL FLOOD ALERT: {city.toUpperCase()}]
            </span>
            <span>
              Elevated inundation at <strong>{topHotspot.name}</strong> ({topHotspot.current_risk} FRI).
              Pumps deployed: {topHotspot.active_pumps}/{topHotspot.required_pumps}. Commuters avoid arterial underpasses.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/hotspots?id=${topHotspot.id}`}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
          >
            <span>Triage Hotspot</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
          <Link
            to="/authority"
            className="text-slate-400 hover:text-white underline text-xs transition"
          >
            Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}
