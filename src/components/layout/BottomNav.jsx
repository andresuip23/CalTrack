import React from 'react';
import { Flame, Calendar, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'daily', label: 'Hoy', icon: Flame },
    { id: 'weekly', label: 'Semana', icon: Calendar },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-6 py-2 flex justify-around items-center z-40">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 text-xs font-medium py-1 transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}