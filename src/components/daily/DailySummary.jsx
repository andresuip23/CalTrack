import React from 'react';
import { Scale } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function DailySummary() {
  const { totalCal, totalProt, totalCarbs, totalFats, goals, userWeight } = useApp();

  const macroConfigs = [
    { label: 'Proteína', current: totalProt, target: goals.protein, color: 'bg-indigo-500' },
    { label: 'Carbos', current: totalCarbs, target: goals.carbs, color: 'bg-amber-500' },
    { label: 'Grasas', current: totalFats, target: goals.fats, color: 'bg-rose-500' },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {/* Calorías totales */}
      <div className="col-span-2 md:col-span-4 bg-slate-900/60 border border-slate-800 p-5 md:p-6 rounded-2xl">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400">Consumo Diario</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-100">
              {totalCal} <span className="text-sm md:text-lg font-normal text-slate-400">/ {goals.calories} kcal</span>
            </h2>
          </div>
          <span className="text-xs md:text-sm font-semibold text-emerald-400">
            {Math.max(0, goals.calories - totalCal)} kcal restantes
          </span>
        </div>
        <ProgressBar value={totalCal} max={goals.calories} height="h-3" />
      </div>

      {/* Macros */}
      {macroConfigs.map((m) => (
        <Card key={m.label} className="p-3.5 md:p-4">
          <span className="text-xs text-slate-400">{m.label}</span>
          <div className="text-base md:text-lg font-bold my-1">
            {m.current}g <span className="text-xs font-normal text-slate-500">/ {m.target}g</span>
          </div>
          <ProgressBar value={m.current} max={m.target} color={m.color} />
        </Card>
      ))}

      {/* Peso */}
      <Card className="p-3.5 md:p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Peso</span>
          <div className="text-base md:text-lg font-bold">{userWeight} kg</div>
        </div>
        <Scale className="text-slate-600" size={20} />
      </Card>
    </section>
  );
}