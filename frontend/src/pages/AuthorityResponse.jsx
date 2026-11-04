import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  Send,
  Droplets,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Truck,
  Users,
  Bell,
  MessageSquare,
  FileCheck,
  RefreshCw,
  Building,
  Info
} from 'lucide-react';
import {
  fetchReports,
  updateReportStatus,
  fetchResources,
  updateResourceStatus,
  fetchHotspots
} from '../services/api';

export default function AuthorityResponse({ selectedCity }) {
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Broadcast Alert Form State
  const [broadcastData, setBroadcastData] = useState({
    alert_level: 'RED ALERT (Severe Inundation)',
    ward: 'Bellandur (Ward 150)',
    message: 'CRITICAL FLOOD WARNING: Bellandur Lake overflow imminent. Evacuate ground floor apartments immediately. Relocate to BBMP Relief Shelter.',
    recipient_count: 42500,
    sent: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [repRes, resRes, hotRes] = await Promise.all([
        fetchReports(selectedCity),
        fetchResources(selectedCity),
        fetchHotspots(selectedCity),
      ]);
      setReports(repRes);
      setResources(resRes);
      setHotspots(hotRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity]);

  const handleUpdateReport = async (reportId, newStatus, note) => {
    try {
      await updateReportStatus(reportId, newStatus, note);
      setStatusMessage(`Incident #${reportId.slice(0, 7)} updated to "${newStatus}"`);
      loadData();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleResource = async (resId, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'Dispatched' : currentStatus === 'Dispatched' ? 'On-Site Active' : 'Available';
    try {
      await updateResourceStatus(resId, nextStatus);
      setStatusMessage(`Asset updated to "${nextStatus}"`);
      loadData();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    setBroadcastData(prev => ({ ...prev, sent: true }));
    setStatusMessage(`🚨 Emergency Broadcast SMS successfully transmitted to ${broadcastData.recipient_count.toLocaleString()} registered cell phones!`);
    setTimeout(() => {
      setBroadcastData(prev => ({ ...prev, sent: false }));
      setStatusMessage(null);
    }, 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-mono mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span className="uppercase tracking-widest font-bold">Disaster Response Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {selectedCity} Emergency Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inter-agency triage interface for BBMP / BMC / GCC, SDRF, Fire & Emergency Services, and Traffic Police.
          </p>
        </div>

        <button
          onClick={loadData}
          className="bg-navy-900 hover:bg-navy-850 text-cyan-400 border border-navy-750 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Operations Feed</span>
        </button>
      </div>

      {/* Global Status Message Toast */}
      {statusMessage && (
        <div className="bg-cyan-500/20 border border-cyan-500/40 p-3.5 rounded-xl text-xs text-cyan-300 flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Key Command Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-mono">Pending Incident Triage</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {reports.filter(r => r.verification_status !== 'Resolved').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Citizen crowd-reports awaiting action</div>
        </div>

        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-mono">City-Wide Stationed Pumps</div>
          <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
            {hotspots.reduce((sum, h) => sum + (h.active_pumps || 0), 0)} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {resources.filter(r => r.type.includes('Pump') && r.status === 'On-Site Active').length} mobile unit active • Across {hotspots.length} hotspots
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-mono">SDRF Rescue Boats</div>
          <div className="text-2xl font-mono font-bold text-teal-400 mt-1">
            {resources.filter(r => r.type.includes('Boat')).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Motorized inflatable watercraft</div>
        </div>

        <div className="bg-navy-900 border border-navy-750 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-mono">CAP Emergency Protocols</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">READY</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Common Alerting Protocol Active</div>
        </div>
      </div>

      {/* 2-Column Command Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Incident Triage Queue */}
        <div className="lg:col-span-7 bg-navy-900 border border-navy-750 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Incident Triage & Dispatch Queue</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review, verify, and dispatch tactical units to citizen-reported flooding choke points.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {reports.length} Reports Logged
            </span>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{rep.location_name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Reported by {rep.reporter_name} • {rep.timestamp} • +{rep.upvotes} confirmations
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                    rep.verification_status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : rep.verification_status === 'Authority Dispatched'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {rep.verification_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-navy-900 p-2.5 rounded-lg border border-navy-800">
                  <div>
                    <span className="text-[10px] text-slate-400">DEPTH:</span>
                    <div className="font-bold text-amber-400">{rep.water_depth_level} ({rep.water_depth_cm}cm)</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">PASSABILITY:</span>
                    <div className="font-bold text-slate-200">{rep.passability}</div>
                  </div>
                </div>

                {rep.notes && (
                  <p className="text-xs text-slate-300 italic">
                    "{rep.notes}"
                  </p>
                )}

                {rep.authority_notes && (
                  <div className="text-xs text-teal-400 font-mono bg-teal-500/10 p-2 rounded border border-teal-500/20">
                    Latest Action: {rep.authority_notes}
                  </div>
                )}

                {/* Authority Action Control Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-navy-800 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Command Action:</span>

                  <button
                    onClick={() => handleUpdateReport(rep.id, 'Official Verified', 'Inspected by Ward Quick Response Gang')}
                    className="bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-700 px-2.5 py-1 rounded-lg transition"
                  >
                    Verify Incident
                  </button>

                  <button
                    onClick={() => handleUpdateReport(rep.id, 'Authority Dispatched', 'De-watering pump crew & traffic diversions on site')}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-semibold transition"
                  >
                    Dispatch Pump Crew
                  </button>

                  <button
                    onClick={() => handleUpdateReport(rep.id, 'Resolved', 'Water pumped out, catch basin desilted & road reopened')}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-semibold transition"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Cols): Equipment Management & Broadcast Alerts */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Emergency Resource Fleet */}
          <div className="bg-navy-900 border border-navy-750 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Heavy Drainage & Rescue Fleet</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Click to Reassign</span>
            </div>

            <div className="space-y-2.5">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-navy-950 p-3 rounded-xl border border-navy-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">{res.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {res.capacity} • {res.assigned_ward}
                    </div>
                    <div className="text-[10px] text-teal-400">{res.contact_person}</div>
                  </div>

                  <button
                    onClick={() => handleToggleResource(res.id, res.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                      res.status === 'On-Site Active'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : res.status === 'Dispatched'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {res.status}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast Emergency SMS / CAP Alert Composer */}
          <div className="bg-navy-900 border border-navy-750 p-5 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-sm uppercase font-mono tracking-wider">
              <Bell className="w-4 h-4 text-red-400" />
              <span>Broadcast Emergency Warning (CAP Protocol)</span>
            </div>

            <div className="bg-navy-950 p-2.5 rounded-xl border border-navy-800 text-[11px] text-amber-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>SIMULATED WORKFLOW:</strong> This CAP alert tool demonstrates simulated broadcast protocols to a test subscriber registry. It does not transmit live commercial cell-broadcast signals.
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Triggers cellular broadcast SMS and warning siren notices to all registered mobile devices in targeted high-risk wards.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Ward</label>
                <select
                  value={broadcastData.ward}
                  onChange={(e) => setBroadcastData({ ...broadcastData, ward: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                >
                  <option value="Bellandur (Ward 150)">Bellandur (Ward 150) - 42,500 Citizens</option>
                  <option value="Madivala / Silk Board (Ward 173)">Madivala / Silk Board (Ward 173) - 38,000 Citizens</option>
                  <option value="Doddakannelli (Ward 149)">Doddakannelli (Ward 149) - 29,000 Citizens</option>
                  <option value="F/South Dadar (Mumbai)">F/South Dadar (Mumbai) - 65,000 Citizens</option>
                  <option value="L Ward Kurla (Mumbai)">L Ward Kurla (Mumbai) - 80,000 Citizens</option>
                  <option value="Zone 13 Velachery (Chennai)">Zone 13 Velachery (Chennai) - 55,000 Citizens</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Alert Emergency Level</label>
                <select
                  value={broadcastData.alert_level}
                  onChange={(e) => setBroadcastData({ ...broadcastData, alert_level: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-red-400 font-bold focus:outline-none focus:border-red-500"
                >
                  <option value="RED ALERT (Severe Inundation)">🔴 RED ALERT — Severe Inundation Threat</option>
                  <option value="ORANGE WARNING (Waterlogging)">🟠 ORANGE WARNING — Road Waterlogging & Diversions</option>
                  <option value="YELLOW ADVISORY (Monsoon)">🟡 YELLOW ADVISORY — Approaching Stormfront</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Warning Message Copy</label>
                <textarea
                  rows="3"
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Transmit Broadcast Warning via SMS & Cell Towers</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
