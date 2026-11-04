import React from 'react';

export default function RiskBadge({ level = 'MODERATE', score = null, size = 'md' }) {
  const normLevel = (level || 'MODERATE').toUpperCase();

  const config = {
    LOW: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'LOW HAZARD',
    },
    MODERATE: {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      dot: 'bg-yellow-400',
      label: 'MODERATE RISK',
    },
    HIGH: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-400',
      label: 'HIGH RISK',
    },
    CRITICAL: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/40',
      dot: 'bg-red-500',
      label: 'CRITICAL INUNDATION',
    },
  }[normLevel] || {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    label: normLevel,
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1.5',
    md: 'text-xs px-2.5 py-1 space-x-2',
    lg: 'text-sm px-3.5 py-1.5 space-x-2.5 font-bold',
  }[size] || 'text-xs px-2.5 py-1 space-x-2';

  return (
    <span className={`inline-flex items-center rounded-full border font-mono font-semibold tracking-wide ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <span className="flex h-2 w-2 relative">
        {normLevel === 'CRITICAL' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      <span>{config.label}</span>
      {score !== null && score !== undefined && (
        <span className="opacity-90 pl-1 border-l border-current/20">
          {typeof score === 'number' ? score.toFixed(1) : score}
        </span>
      )}
    </span>
  );
}
