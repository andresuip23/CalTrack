import React from 'react';

export function ProgressBar({ value, max, color = 'bg-emerald-400', height = 'h-1.5' }) {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height}`}>
      <div
        className={`${color} h-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}