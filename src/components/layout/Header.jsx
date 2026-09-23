import React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Header() {
  const { todayStr } = useApp();

  return (
    <header className="flex justify-between items-center border-b border-slate-800 pb-4">
      <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent flex items-center gap-2">
        <Flame className="text-emerald-400" /> MacroTracker
      </h1>
      <span className="text-xs text-slate-500 font-medium">{todayStr}</span>
    </header>
  );
}