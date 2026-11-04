import React from 'react';
import { HelpCircle, Layers, TrendingUp } from 'lucide-react';

export default function FeatureContributionBar({ contributions = [], showHeader = true }) {
  if (!contributions || contributions.length === 0) {
    return <div className="text-xs text-slate-500 italic">No feature contribution data available.</div>;
  }

  const getFeatureColor = (feature) => {
    switch (feature) {
      case 'rainfall':
        return { bar: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/10 border-cyan-500/30' };
      case 'elevation':
        return { bar: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/30' };
      case 'water_proximity':
        return { bar: 'bg-teal-500', text: 'text-teal-400', badge: 'bg-teal-500/10 border-teal-500/30' };
      case 'drainage':
        return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30' };
      case 'imperviousness':
        return { bar: 'bg-rose-500', text: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30' };
      case 'slope':
        return { bar: 'bg-blue-500', text: 'text-blue-400', badge: 'bg-blue-500/10 border-blue-500/30' };
      case 'historical':
        return { bar: 'bg-purple-500', text: 'text-purple-400', badge: 'bg-purple-500/10 border-purple-500/30' };
      case 'tide':
        return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { bar: 'bg-slate-500', text: 'text-slate-400', badge: 'bg-slate-500/10 border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center justify-between border-b border-navy-750 pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Weighted Risk Feature Contributions (MCDA)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Sum = 100%
          </span>
        </div>
      )}

      {/* Stacked Visual Bar */}
      <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden flex shadow-inner border border-navy-800">
        {contributions.map((c, idx) => {
          const col = getFeatureColor(c.feature);
          return (
            <div
              key={idx}
              style={{ width: `${Math.max(3, c.percentage)}%` }}
              title={`${c.label}: ${c.percentage}%`}
              className={`h-full ${col.bar} transition-all hover:opacity-80`}
            />
          );
        })}
      </div>

      {/* Feature Breakdown Rows */}
      <div className="space-y-2 pt-1">
        {contributions.map((c, idx) => {
          const col = getFeatureColor(c.feature);
          return (
            <div
              key={idx}
              className="bg-navy-850/80 hover:bg-navy-850 p-2.5 rounded-xl border border-navy-750 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${col.bar}`} />
                  <span className="text-xs font-semibold text-slate-200">{c.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({c.raw_value} {c.unit})
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono">
                  <span className={`text-xs font-bold ${col.text}`}>
                    +{c.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-500">contribution</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-4">
                {c.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
