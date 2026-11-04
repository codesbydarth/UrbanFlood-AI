import React from 'react';
import { Waves, ShieldAlert, Heart, ExternalLink, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800/80 text-slate-400 text-xs py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center text-navy-950 font-bold">
                <Waves className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">URBANFLOOD <span className="text-cyan-400">AI</span></span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AI-assisted urban flood early-warning & response intelligence platform designed for high-density Indian metropolitan basins.
            </p>
          </div>

          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase mb-2 text-cyan-400">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/" className="hover:text-white transition">Overview & Hero</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Flood Risk Dashboard</Link></li>
              <li><Link to="/map" className="hover:text-white transition">Interactive Inundation Map</Link></li>
              <li><Link to="/hotspots" className="hover:text-white transition">Hotspot Hydrologic Profiles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-mono font-bold text-xs uppercase mb-2 text-teal-400">Action & Response</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/report" className="hover:text-white transition">Citizen Waterlogging Report</Link></li>
              <li><Link to="/authority" className="hover:text-white transition">Authority Response Command</Link></li>
              <li><Link to="/model-info" className="hover:text-white transition">Model & MCDA Architecture</Link></li>
              <li><a href="/docs" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center space-x-1"><span>FastAPI Backend Docs</span> <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-mono font-bold text-xs uppercase text-amber-400 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Prototype Disclosure</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Simulated Data Notice:</strong> This application is a hackathon prototype demonstrating geospatial AI intelligence. Data shown is hydrologically calibrated simulation and must not be used as official disaster evacuation orders.
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © 2026 URBANFLOOD AI — Designed for Indian Municipal Corporations (BBMP, BMC, GCC).
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-cyan-500">v2.1.0-explainable</span>
            <span>•</span>
            <span className="text-slate-400">Built with React, Vite, Leaflet & FastAPI</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
