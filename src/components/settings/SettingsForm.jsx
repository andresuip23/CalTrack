import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const r1 = (n) => Math.round(n * 10) / 10;

function validate(weight, goals) {
  const w = Number(weight);
  const cal = Number(goals.calories);
  const prot = Number(goals.protein);
  const carbs = Number(goals.carbs);
  const fats = Number(goals.fats);

  if (weight === '' || !Number.isFinite(w) || w < 20 || w > 500) {
    return { error: 'El peso debe estar entre 20 y 500 kg.' };
  }
  if (goals.calories === '' || !Number.isFinite(cal) || cal < 500 || cal > 10000) {
    return { error: 'Las calorías deben estar entre 500 y 10000.' };
  }
  for (const [label, v, raw] of [
    ['Proteínas', prot, goals.protein],
    ['Carbohidratos', carbs, goals.carbs],
    ['Grasas', fats, goals.fats],
  ]) {
    if (raw === '' || !Number.isFinite(v) || v < 0 || v > 2000) {
      return { error: `${label}: escribe un valor entre 0 y 2000 g.` };
    }
  }

  return {
    values: {
      weight: r1(w),
      goals: {
        calories: Math.round(cal),
        protein: Math.round(prot),
        carbs: Math.round(carbs),
        fats: Math.round(fats),
      },
    },
  };
}

function SettingsFormInner({ currentGoals, currentWeight, onSave }) {
  const [weight, setWeight] = useState(String(currentWeight ?? ''));
  const [goals, setGoals] = useState({
    calories: String(currentGoals.calories ?? ''),
    protein: String(currentGoals.protein ?? ''),
    carbs: String(currentGoals.carbs ?? ''),
    fats: String(currentGoals.fats ?? ''),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setGoal = (field) => (e) => setGoals((prev) => ({ ...prev, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    const result = validate(weight, goals);
    if (result.error) {
      setError(result.error);
      return;
    }

    setSaving(true);
    try {
      await onSave(result.values.goals, result.values.weight);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Error al guardar la configuración:', err);
      setError('No se pudo guardar la configuración. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl max-w-xl mx-auto space-y-4">
      <h2 className="text-lg font-bold">Ajustar Intake y Peso</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Peso Actual (kg)</label>
          <Input
            type="number"
            min="20"
            max="500"
            step="any"
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
              min="500"
              max="10000"
              step="any"
              value={goals.calories}
              onChange={setGoal('calories')}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Proteínas (g)</label>
            <Input
              type="number"
              min="0"
              max="2000"
              step="any"
              value={goals.protein}
              onChange={setGoal('protein')}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Carbohidratos (g)</label>
            <Input
              type="number"
              min="0"
              max="2000"
              step="any"
              value={goals.carbs}
              onChange={setGoal('carbs')}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Grasas (g)</label>
            <Input
              type="number"
              min="0"
              max="2000"
              step="any"
              value={goals.fats}
              onChange={setGoal('fats')}
              className="w-full"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full py-3">
          {saved ? 'Guardado ✓' : saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </form>
    </section>
  );
}

export function SettingsForm() {
  const { goals, userWeight, loadingSettings, handleSaveSettings } = useApp();

  // Espera a que lleguen los ajustes reales: si no, el formulario arrancaría con
  // los valores por defecto y al guardar podría pisar tus metas verdaderas
  if (loadingSettings) {
    return <p className="text-center text-xs text-slate-500 py-4">Cargando ajustes...</p>;
  }

  return (
    <SettingsFormInner
      currentGoals={goals}
      currentWeight={userWeight}
      onSave={handleSaveSettings}
    />
  );
}