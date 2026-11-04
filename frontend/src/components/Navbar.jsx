import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Waves,
  ShieldAlert,
  MapPin,
  BarChart3,
  Map as MapIcon,
  Radio,
  FileText,
  AlertTriangle,
  PhoneCall,
  Menu,
  X,
  Info,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ selectedCity, onSelectCity, cities = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelplineModal, setShowHelplineModal] = useState(false);

  const currentCityObj = cities.find(c => c.name.toLowerCase() === selectedCity.toLowerCase()) || {
    name: selectedCity,
    agency: "Municipal Disaster Cell",
    emergency_helpline: "1077 / 112"
  };

  const navItems = [
    { name: 'Overview', path: '/', icon: Waves },
    { name: 'Risk Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Live Map', path: '/map', icon: MapIcon },
    { name: 'Hotspots', path: '/hotspots', icon: Radio },
    { name: 'Citizen Report', path: '/report', icon: AlertTriangle },
    { name: 'Authority Center', path: '/authority', icon: ShieldAlert },
    { name: 'Data & Models', path: '/model-info', icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur-md border-b border-navy-800/80 transition-all w-full max-w-full overflow-hidden">
        {/* Top Emergency Ticker & Notice */}
        <div className="bg-navy-900 border-b border-navy-800 px-4 py-1 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono text-cyan-400 font-semibold tracking-wider text-[11px] uppercase">
              Operational Status:
            </span>
            <span className="truncate text-slate-300">
              Active Monitoring over <strong className="text-white">{selectedCity}</strong> Basin — Explainable Hydrologic Engine Active
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-[11px]">
            <span className="bg-navy-800 text-teal-400 px-2 py-0.5 rounded border border-navy-700 font-mono">
              DEMO / HACKATHON PROTOTYPE
            </span>
            <button
              onClick={() => setShowHelplineModal(true)}
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-medium transition"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Emergency SOS: {currentCityObj.emergency_helpline?.split('/')[0]}</span>
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition flex-shrink-0">
                <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-navy-950 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <span className="text-base sm:text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition truncate">
                    URBANFLOOD
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold px-1 sm:px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded flex-shrink-0">
                    AI
                  </span>
                </div>
                <div className="hidden sm:block text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                  Early-Warning & Response Intel
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-navy-850'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* City Selector & Controls */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="relative">
                <div className="flex items-center bg-navy-850 border border-navy-700 rounded-lg px-2.5 py-1.5 space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-slate-400 font-mono">City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => onSelectCity(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="Bengaluru" className="bg-navy-900 text-white">Bengaluru (BBMP)</option>
                    <option value="Mumbai" className="bg-navy-900 text-white">Mumbai (BMC)</option>
                    <option value="Chennai" className="bg-navy-900 text-white">Chennai (GCC)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowHelplineModal(true)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Helplines</span>
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="lg:hidden flex items-center space-x-1.5 flex-shrink-0">
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-navy-850 text-xs font-semibold text-cyan-400 border border-navy-700 rounded px-2 py-1 focus:outline-none"
              >
                <option value="Bengaluru" className="bg-navy-900">BLR</option>
                <option value="Mumbai" className="bg-navy-900">BOM</option>
                <option value="Chennai" className="bg-navy-900">MAA</option>
              </select>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg bg-navy-850 text-slate-300 hover:text-white flex-shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-900 border-b border-navy-800 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-850'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-cyan-400" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-navy-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowHelplineModal(true);
                }}
                className="w-full bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Emergency Helplines & SOS</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Emergency Helpline Modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowHelplineModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Helplines</h3>
                <p className="text-xs text-slate-400 font-mono">Disaster Management & Rescue Services</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-navy-850 p-3 rounded-xl border border-navy-750">
                <div className="text-xs text-slate-400 font-mono">National Emergency Number</div>
                <div className="text-xl font-mono font-bold text-cyan-400">112</div>
                <div className="text-xs text-slate-400">Police, Fire & Ambulance Services</div>
              </div>

              <div className="bg-navy-850 p-3 rounded-xl border border-navy-750">
                <div className="text-xs text-slate-400 font-mono">{currentCityObj.name} Municipal Disaster Cell</div>
                <div className="text-lg font-mono font-bold text-amber-400">{currentCityObj.emergency_helpline}</div>
                <div className="text-xs text-slate-400">Agency: {currentCityObj.agency}</div>
              </div>

              <div className="bg-navy-850 p-3 rounded-xl border border-navy-750">
                <div className="text-xs text-slate-400 font-mono">State Disaster Response Force (SDRF / NDRF)</div>
                <div className="text-lg font-mono font-bold text-teal-400">1070 / 1077</div>
                <div className="text-xs text-slate-400">Flood Inundation & Boat Evacuation Operations</div>
              </div>

              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-amber-400 font-bold block mb-1">Demonstration & Public Reference Notice:</span>
                The contacts above are official public municipal and national disaster helplines in India (National: 112, SDMA: 1070/1077, BBMP: 1533, BMC: 1916, GCC: 1913). UrbanFlood AI is an engineering simulation prototype and is not connected to live emergency dispatchers. In an immediate life-threatening situation, dial 112 directly.
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-navy-800 flex justify-end">
              <button
                onClick={() => setShowHelplineModal(false)}
                className="bg-navy-800 hover:bg-navy-750 text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
