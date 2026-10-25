import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// MET aproximados (compendio de actividad física). Calorías = MET x peso (kg) x horas
export const WORKOUT_TYPES = [
  { id: 'weights', label: 'Pesas', met: 5.0 },
  { id: 'running', label: 'Correr', met: 9.8 },
  { id: 'walking', label: 'Caminar', met: 3.5 },
  { id: 'cycling', label: 'Ciclismo', met: 7.5 },
  { id: 'football', label: 'Fútbol', met: 7.0 },
  { id: 'swimming', label: 'Natación', met: 6.0 },
  { id: 'hiit', label: 'HIIT', met: 8.0 },
  { id: 'yoga', label: 'Yoga', met: 2.5 },
  { id: 'other', label: 'Otro', met: 5.0 },
];

export function WorkoutCard() {
  const {
    workouts,
    loadingWorkouts,
    addWorkout,
    deleteWorkout,
    userWeight,
    goals,
    totalCal,
    totalBurned,
    exerciseCredit,
    creditedCalories,
    effectiveCalGoal,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [typeId, setTypeId] = useState('weights');
  const [customName, setCustomName] = useState('');
  const [minutes, setMinutes] = useState('45');
  const [kcalOverride, setKcalOverride] = useState(null);
  const [saving, setSaving] = useState(false);

  const type = WORKOUT_TYPES.find((t) => t.id === typeId) || WORKOUT_TYPES[0];
  const minutesNum = Number(minutes) || 0;
  const computedKcal = Math.round(type.met * (Number(userWeight) || 0) * (minutesNum / 60));
  const kcalValue = kcalOverride ?? String(computedKcal);

  const canSave =
    minutesNum > 0 &&
    Number(kcalValue) >= 0 &&
    kcalValue !== '' &&
    (typeId !== 'other' || customName.trim() !== '');

  const resetForm = () => {
    setTypeId('weights');
    setCustomName('');
    setMinutes('45');
    setKcalOverride(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      await addWorkout({
        type: typeId,
        name: typeId === 'other' ? customName.trim() : type.label,
        minutes: minutesNum,
        calories: Math.round(Number(kcalValue)),
      });
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error('Error al guardar entrenamiento:', err);
    } finally {
      setSaving(false);
    }
  };

  const remaining = effectiveCalGoal - totalCal;
  const over = remaining < 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <Dumbbell size={18} className="text-emerald-400" /> Entrenamiento de hoy
        </h3>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          className="border border-slate-800"
        >
          {open ? (
            <>
              <X size={16} /> Cerrar
            </>
          ) : (
            <>
              <Plus size={16} /> Añadir
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTypeId(t.id);
                  setKcalOverride(null);
                }}
                className={
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ' +
                  (t.id === typeId
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {typeId === 'other' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre del ejercicio</label>
              <Input
                type="text"
                placeholder="Ej. Escalada"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Duración (min)</label>
              <Input
                type="number"
                min="1"
                value={minutes}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  setKcalOverride(null);
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Calorías quemadas (kcal)</label>
              <Input
                type="number"
                min="0"
                value={kcalValue}
                onChange={(e) => setKcalOverride(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Estimado con tu peso ({userWeight} kg). Si tu reloj o máquina te da otro número, escríbelo en calorías.
          </p>

          <Button type="submit" disabled={!canSave || saving} className="w-full">
            <Plus size={16} /> Guardar entrenamiento
          </Button>
        </form>
      )}

      {loadingWorkouts ? (
        <p className="text-center text-xs text-slate-500 py-2">Cargando...</p>
      ) : workouts.length === 0 ? (
        <p className="text-sm text-slate-500">Hoy no has registrado ejercicio.</p>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{w.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {w.minutes} min | {Math.round(Number(w.calories || 0))} kcal quemadas
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteWorkout(w.id)}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                aria-label="Borrar entrenamiento"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Meta base</span>
          <span>{Math.round(goals.calories)} kcal</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>
            Ejercicio
            {exerciseCredit.enabled && totalBurned > 0 && (
              <span className="text-xs text-slate-500">
                {' '}({exerciseCredit.percent}% de {Math.round(totalBurned)} kcal)
              </span>
            )}
          </span>
          <span className="text-emerald-400">+{creditedCalories} kcal</span>
        </div>
        <div className="flex justify-between font-semibold text-slate-100 border-t border-slate-800 pt-1.5">
          <span>Meta de hoy</span>
          <span>{Math.round(effectiveCalGoal)} kcal</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Comido</span>
          <span>{Math.round(totalCal)} kcal</span>
        </div>
        <div className={`flex justify-between font-bold ${over ? 'text-amber-400' : 'text-emerald-400'}`}>
          <span>{over ? 'Te pasaste' : 'Te quedan'}</span>
          <span>{Math.abs(Math.round(remaining))} kcal</span>
        </div>
        {!exerciseCredit.enabled && (
          <p className="text-xs text-slate-500 pt-1">
            Sumar el ejercicio a tu meta está apagado. Puedes activarlo en Ajustes.
          </p>
        )}
      </div>
    </div>
  );
}