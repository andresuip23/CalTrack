import React from 'react';
import { Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';

export function HistoryList() {
  const { weeklyLogs } = useApp();

  const sortedLogs = [...weeklyLogs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Calendar className="text-emerald-400" /> Historial Diario
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {sortedLogs.map((log) => (
          <Card key={log.id} className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">{log.date}</div>
              <div className="text-xs text-slate-400">Peso: {log.weight || '--'} kg</div>
            </div>
            <div className="text-right">
              <span className="text-base md:text-lg font-black text-emerald-400">{log.calories} kcal</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}