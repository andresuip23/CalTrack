import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-900/40 border border-slate-800 p-4 rounded-xl ${className}`}>
      {children}
    </div>
  );
}