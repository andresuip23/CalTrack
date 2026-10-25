import React from 'react';
import { useApp } from '../../context/AppContext';
import { MealItem } from './MealItem';

export function MealList() {
  const { meals, deleteMeal } = useApp();

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registros de hoy</h3>
      {meals.length === 0 ? (
        <div className="text-center py-8 text-slate-600 text-sm border border-dashed border-slate-800 rounded-2xl">
          No has registrado comidas hoy.
        </div>
      ) : (
        meals.map((meal) => (
          <MealItem key={meal.id} meal={meal} onDelete={deleteMeal} />
        ))
      )}
    </section>
  );
}