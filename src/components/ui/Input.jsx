import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-base md:text-sm focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-600 ${className}`}
      {...props}
    />
  );
}