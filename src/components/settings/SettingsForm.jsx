import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function SettingsForm() {
  const { goals: currentGoals, userWeight: currentWeight, handleSaveSettings } = useApp();

  const [weight, setWeight] = useState(currentWeight);
  const [goals, setGoals] = useState({ ...currentGoals });

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSaveSettings(goals, Number(weight));
    alert('Configuración guardada correctamente.');
  };

  return (
    <section className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl max-w-xl mx-auto space-y-4">
      <h2 className="text-lg font-bold">Ajustar Intake y Peso</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Peso Actual (kg)</label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Calorías Target</label>
            <Input
              type="number"
              value={goals.calories}
              onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Proteínas (g)</label>
            <Input
              type="number"
              value={goals.protein}
              onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Carbohidratos (g)</label>
            <Input
              type="number"
              value={goals.carbs}
              onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Grasas (g)</label>
            <Input
              type="number"
              value={goals.fats}
              onChange={(e) => setGoals({ ...goals, fats: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <Button type="submit" className="w-full py-3">
          Guardar Configuración
        </Button>
      </form>
    </section>
  );
}