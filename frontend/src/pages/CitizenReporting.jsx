import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  MapPin,
  Camera,
  Users,
  CheckCircle2,
  ThumbsUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  Filter,
  Car,
  Zap,
  PhoneCall,
  Info
} from 'lucide-react';
import { fetchReports, submitCitizenReport, upvoteReport } from '../services/api';

export default function CitizenReporting({ selectedCity }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [filterCity, setFilterCity] = useState(selectedCity);

  // Form State
  const [formData, setFormData] = useState({
    city: selectedCity,
    location_name: '',
    lat: selectedCity.toLowerCase() === 'bengaluru' ? 12.9260 : selectedCity.toLowerCase() === 'mumbai' ? 19.0118 : 12.9790,
    lng: selectedCity.toLowerCase() === 'bengaluru' ? 77.6835 : selectedCity.toLowerCase() === 'mumbai' ? 72.8427 : 80.2185,
    water_depth_level: 'Knee-deep (1-2 ft)',
    water_depth_cm: 45,
    passability: '4-Wheelers Only',
    hazard_types: ['Submerged Median'],
    stranded_people_count: 0,
    reporter_name: '',
    contact_number: '',
    notes: '',
    image_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      city: selectedCity,
      lat: selectedCity.toLowerCase() === 'bengaluru' ? 12.9260 : selectedCity.toLowerCase() === 'mumbai' ? 19.0118 : 12.9790,
      lng: selectedCity.toLowerCase() === 'bengaluru' ? 77.6835 : selectedCity.toLowerCase() === 'mumbai' ? 72.8427 : 80.2185,
    }));
    setFilterCity(selectedCity);
  }, [selectedCity]);

  // Fetch reports
  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetchReports(filterCity);
      setReports(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filterCity]);

  const handleHazardToggle = (hazard) => {
    setFormData(prev => {
      const exists = prev.hazard_types.includes(hazard);
      return {
        ...prev,
        hazard_types: exists
          ? prev.hazard_types.filter(h => h !== hazard)
          : [...prev.hazard_types, hazard]
      };
    });
  };

  const handleDepthChange = (level, cm) => {
    setFormData(prev => ({
      ...prev,
      water_depth_level: level,
      water_depth_cm: cm
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location_name) return;
    setSubmitting(true);
    try {
      await submitCitizenReport({
        city: formData.city,
        location_name: formData.location_name,
        coordinates: [parseFloat(formData.lat), parseFloat(formData.lng)],
        water_depth_level: formData.water_depth_level,
        water_depth_cm: parseFloat(formData.water_depth_cm),
        passability: formData.passability,
        hazard_types: formData.hazard_types,
        stranded_people_count: parseInt(formData.stranded_people_count) || 0,
        reporter_name: formData.reporter_name || 'Anonymous Resident',
        contact_number: formData.contact_number,
        notes: formData.notes,
        image_url: formData.image_url
      });
      setSubmitSuccess(true);
      // Reset some fields
      setFormData(prev => ({ ...prev, location_name: '', notes: '', stranded_people_count: 0 }));
      loadReports();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      await upvoteReport(id);
      loadReports();
    } catch (err) {
      console.error(err);
    }
  };

  const hazardOptions = [
    'Open Manhole / Missing Cover',
    'Fallen Tree / Large Debris',
    'Live Electric Wire / Transformer Hazard',
    'Submerged Vehicles / Stranded Bus',
    'Sewage Contamination Backflow',
    'Pedestrian Walkway Blocked'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-navy-800 pb-5">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="uppercase tracking-widest font-bold">Crowdsourced Incident Ground Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Citizen Flood & Waterlogging Reporting
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Help municipal response teams prioritize drainage pumps and alert fellow commuters by reporting live inundation depths, road passability, and hazards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Reporting Form */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-750 p-6 rounded-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Log Incident Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified reports are dispatched directly to the municipal disaster command queue.
            </p>
          </div>

          <div className="bg-navy-950 p-2.5 rounded-xl border border-navy-800 text-[11px] text-amber-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>DEMO REPORTING PORTAL:</strong> Submissions persist to local demonstration storage and feed the authority triage queue for hackathon evaluation.
            </span>
          </div>

          {submitSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-xs text-emerald-300 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="font-bold text-white">Report Successfully Logged!</strong>
                <p>Your report has been broadcast to municipal disaster triage & fellow commuters.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* City & Location Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">City Basin</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="Bengaluru">Bengaluru (BBMP)</option>
                  <option value="Mumbai">Mumbai (BMC)</option>
                  <option value="Chennai">Chennai (GCC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Landmark / Street *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk Board Underpass / Near Shell Petrol Bunk"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3 bg-navy-950/60 p-3 rounded-xl border border-navy-800">
              <div>
                <label className="block text-[10px] font-mono text-slate-400">LATITUDE</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400">LONGITUDE</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Water Depth Level (Visual Pills) */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">
                Observed Water Depth Level *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Ankle-deep (< 6 in)', cm: 15, col: 'border-yellow-500/40 text-yellow-400' },
                  { label: 'Knee-deep (1-2 ft)', cm: 45, col: 'border-orange-500/40 text-orange-400' },
                  { label: 'Waist-deep (3-4 ft)', cm: 95, col: 'border-red-500/40 text-red-400' },
                  { label: 'Submerged (> 4 ft)', cm: 140, col: 'border-purple-500/40 text-purple-400' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleDepthChange(item.label, item.cm)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                      formData.water_depth_level === item.label
                        ? `bg-navy-850 ${item.col} ring-1 ring-cyan-500`
                        : 'bg-navy-950/50 border-navy-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-75 font-mono">~{item.cm} cm</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Passability */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Road Passability</label>
              <select
                value={formData.passability}
                onChange={(e) => setFormData({ ...formData, passability: e.target.value })}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
              >
                <option value="Passable (All)">Passable (All Vehicles Can Proceed Slowly)</option>
                <option value="4-Wheelers Only">Passable by 4-Wheelers / High Clearance Only</option>
                <option value="Heavy Vehicles Only">Heavy Vehicles Only (Buses / Trucks)</option>
                <option value="Completely Blocked">Completely Blocked / Road Closed</option>
              </select>
            </div>

            {/* Hazard Types */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Active Hazards at Location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hazardOptions.map((haz) => (
                  <label
                    key={haz}
                    className={`flex items-center space-x-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                      formData.hazard_types.includes(haz)
                        ? 'bg-red-500/10 border-red-500/40 text-red-300'
                        : 'bg-navy-950/50 border-navy-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.hazard_types.includes(haz)}
                      onChange={() => handleHazardToggle(haz)}
                      className="accent-red-500"
                    />
                    <span className="truncate">{haz}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stranded people slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Stranded Citizens / Commuters:</span>
                <span className="font-bold text-amber-400">{formData.stranded_people_count} People</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={formData.stranded_people_count}
                onChange={(e) => setFormData({ ...formData, stranded_people_count: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Reporter Contact & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.reporter_name}
                  onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98450 XXXXX"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Additional Observations / Notes</label>
              <textarea
                rows="2"
                placeholder="Describe current drainage flow, traffic gridlock, or emergency rescue needs..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-navy-950 font-bold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {submitting ? (
                <span>Broadcasting to Municipal Queue...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Transmit Incident Report to Disaster Cell</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Incident Feed */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Live Incident Telemetry Feed
              </h2>
              <p className="text-xs text-slate-400">
                Community corroborated incidents currently being triaged.
              </p>
            </div>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="bg-navy-950 border border-navy-750 text-xs font-semibold text-cyan-400 px-3 py-1.5 rounded-xl focus:outline-none"
            >
              <option value="Bengaluru">Bengaluru Reports</option>
              <option value="Mumbai">Mumbai Reports</option>
              <option value="Chennai">Chennai Reports</option>
            </select>
          </div>

          {/* List of Reports */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <div className="bg-navy-900 border border-navy-750 p-8 rounded-2xl text-center text-slate-400 text-xs font-mono">
                No active citizen incidents reported for {filterCity} yet.
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-navy-900 border border-navy-750 hover:border-navy-700 p-4 rounded-2xl transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        rep.verification_status === 'Official Verified'
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : rep.verification_status === 'Authority Dispatched'
                          ? 'bg-teal-500/20 text-teal-400 border-teal-500/40'
                          : rep.verification_status === 'Community Verified'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                      }`}>
                        {rep.verification_status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{rep.timestamp}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleUpvote(rep.id)}
                      className="bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition"
                    >
                      <ThumbsUp className="w-3 h-3 text-cyan-400" />
                      <span>Confirm (+{rep.upvotes})</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white">{rep.location_name}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Reported by {rep.reporter_name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-navy-950 p-2.5 rounded-xl border border-navy-800">
                    <div>
                      <span className="text-[10px] text-slate-400">DEPTH:</span>
                      <div className="font-bold text-amber-400">{rep.water_depth_level} ({rep.water_depth_cm}cm)</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">PASSABILITY:</span>
                      <div className="font-bold text-white truncate">{rep.passability}</div>
                    </div>
                  </div>

                  {rep.hazard_types && rep.hazard_types.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rep.hazard_types.map((haz, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-red-500/15 border border-red-500/30 text-red-300 px-2 py-0.5 rounded font-medium"
                        >
                          {haz}
                        </span>
                      ))}
                    </div>
                  )}

                  {rep.notes && (
                    <p className="text-xs text-slate-300 italic bg-navy-850/60 p-2 rounded-lg border border-navy-800">
                      "{rep.notes}"
                    </p>
                  )}

                  {rep.authority_notes && (
                    <div className="text-[11px] text-teal-400 font-mono flex items-center space-x-1.5 pt-1 border-t border-navy-800">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Action Note: {rep.authority_notes}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
