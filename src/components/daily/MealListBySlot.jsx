import React from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const fmt = (n) => Math.round(Number(n || 0) * 10) / 10;

export function MealListBySlot() {
  const { meals, loadingMeals, mealSlots, deleteMeal } = useApp();

  if (loadingMeals) {
    return <p className="text-center text-xs text-slate-500 py-4">Cargando comidas...</p>;
  }

  if (meals.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500 py-6">
        Aún no has registrado comidas hoy.
      </p>
    );
  }

  const knownIds = new Set(mealSlots.map((s) => s.id));

  const groups = mealSlots
    .map((slot) => ({
      id: slot.id,
      name: slot.name,
      items: meals.filter((m) => m.slot === slot.id),
    }))
    .filter((g) => g.items.length > 0);

  const others = meals.filter((m) => !knownIds.has(m.slot));
  if (others.length > 0) {
    groups.push({ id: '__other', name: 'Sin clasificar', items: others });
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const groupCal = group.items.reduce((sum, m) => sum + Number(m.calories || 0), 0);
        return (
          <div key={group.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-100">{group.name}</h3>
              <span className="text-xs text-emerald-400 font-semibold">{Math.round(groupCal)} kcal</span>
            </div>

            <div className="space-y-2">
              {group.items.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{meal.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {Math.round(Number(meal.calories || 0))} kcal | P: {fmt(meal.protein)}g | C: {fmt(meal.carbs)}g | G: {fmt(meal.fats)}g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMeal(meal.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                    aria-label="Borrar comida"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}