import React from 'react';
import { useApp } from '../../context/AppContext';

export function SlotSelector({ label = 'Registrar en:' }) {
  const { mealSlots, currentSlotId, setActiveSlotId } = useApp();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
      <p className="text-xs text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {mealSlots.map((slot) => {
          const active = slot.id === currentSlotId;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setActiveSlotId(slot.id)}
              className={
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ' +
                (active
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600')
              }
            >
              {slot.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}