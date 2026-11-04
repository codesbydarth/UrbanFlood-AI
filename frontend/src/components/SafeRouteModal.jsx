import React, { useState, useEffect } from 'react';
import { X, Navigation, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { checkSafeRoute } from '../services/api';

const CITY_PRESETS = {
  Bengaluru: {
    origin: 'Koramangala 4th Block',
    originCoords: [12.9352, 77.6245],
    destination: 'Bellandur EcoSpace (ORR)',
    destCoords: [12.9260, 77.6835],
    corridorName: 'Koramangala ➔ ORR Bellandur Tech Corridor'
  },
  Mumbai: {
    origin: 'Dadar TT Circle (Hindmata)',
    originCoords: [19.0178, 72.8478],
    destination: 'Kurla West (LBS Marg)',
    destCoords: [19.0700, 72.8795],
    corridorName: 'Dadar ➔ Kurla Mithi Basin Arterial'
  },
  Chennai: {
    origin: 'T. Nagar (Usman Road Subway)',
    originCoords: [13.0418, 80.2340],
    destination: 'Velachery 100-Ft Bypass',
    destCoords: [12.9790, 80.2185],
    corridorName: 'T. Nagar ➔ Velachery MRTS Corridor'
  }
};

export default function SafeRouteModal({ isOpen, onClose, selectedCity }) {
  const currentCityKey = selectedCity || 'Bengaluru';
  const preset = CITY_PRESETS[currentCityKey] || CITY_PRESETS['Bengaluru'];

  const [origin, setOrigin] = useState(preset.origin);
  const [destination, setDestination] = useState(preset.destination);
  const [originCoords, setOriginCoords] = useState(preset.originCoords);
  const [destCoords, setDestCoords] = useState(preset.destCoords);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Sync with selected city changes
  useEffect(() => {
    const p = CITY_PRESETS[selectedCity] || CITY_PRESETS['Bengaluru'];
    setOrigin(p.origin);
    setDestination(p.destination);
    setOriginCoords(p.originCoords);
    setDestCoords(p.destCoords);
    setResult(null);
  }, [selectedCity, isOpen]);

  if (!isOpen) return null;

  const handleCalculateRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use city-aware coordinates
      const start = originCoords || preset.originCoords;
      const end = destCoords || preset.destCoords;
      const res = await checkSafeRoute(selectedCity, start, end);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Safe Route & Flood Bypass</h3>
            <p className="text-xs text-slate-400 font-mono">
              Basin: <strong className="text-cyan-400">{selectedCity}</strong> • Avoid submerged underpasses
            </p>
          </div>
        </div>

        {/* Selected City Preset Indicator */}
        <div className="bg-navy-950 p-2.5 rounded-xl border border-navy-800 mb-3 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Corridor:</span>
          </span>
          <span className="text-teal-400 font-semibold">{preset.corridorName}</span>
        </div>

        <form onSubmit={handleCalculateRoute} className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Current Location / Origin ({selectedCity})
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              placeholder={`e.g. ${preset.origin}`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Destination ({selectedCity})
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              placeholder={`e.g. ${preset.destination}`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            {loading ? (
              <span>Analyzing {selectedCity} Hydrologic Corridors...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Calculate Flood-Safe Corridor</span>
              </>
            )}
          </button>
        </form>

        {/* Route Result */}
        {result && (
          <div className="bg-navy-850 p-4 rounded-xl border border-navy-750 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Routing Status ({result.city})</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                result.hazard_level === 'HIGH HAZARD'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {result.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {result.detour_summary}
            </p>

            {result.avoided_hotspots && result.avoided_hotspots.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono text-red-400 font-semibold flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Detected Inundation Choke Points in {result.city}:</span>
                </div>
                {result.avoided_hotspots.map((h, i) => (
                  <div key={i} className="text-xs bg-navy-900 p-2 rounded-lg border border-red-500/30 text-slate-300">
                    <strong className="text-white">{h.hotspot_name}:</strong> {h.advisory}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-navy-800 font-mono">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Est. Flood Delay: +{result.estimated_delay_mins} mins</span>
              </span>
              <span className="text-teal-400 font-semibold">Elevated Bypass Active</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-navy-800 flex justify-between items-center text-[11px] text-slate-500">
          <span>*Simulation proxy model for prototype demonstration</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white underline text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
