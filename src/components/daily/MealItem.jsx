import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function MealItem({ meal, onDelete }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
      <div>
        <h4 className="font-semibold text-slate-200 text-sm md:text-base">{meal.name}</h4>
        <div className="text-xs text-slate-400 flex gap-2 md:gap-3 mt-1">
          <span>P: {meal.protein}g</span>
          <span>C: {meal.carbs}g</span>
          <span>G: {meal.fats}g</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-emerald-400 text-sm md:text-base">{meal.calories} kcal</span>
        <Button variant="ghost" onClick={() => onDelete(meal.id)} aria-label="Eliminar comida">
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}