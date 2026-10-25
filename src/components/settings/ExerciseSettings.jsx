import React from 'react';
import { useApp } from '../../context/AppContext';

const PERCENTS = [25, 50, 75, 100];

export function ExerciseSettings() {
  const { exerciseCredit, updateExerciseCredit } = useApp();

  const setEnabled = () =>
    updateExerciseCredit({ ...exerciseCredit, enabled: !exerciseCredit.enabled });

  const setPercent = (percent) => updateExerciseCredit({ ...exerciseCredit, percent });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="font-bold text-slate-100">Ejercicio y meta de calorías</h3>
        <p className="text-xs text-slate-400 mt-1">
          Los días que entrenas, tu meta de calorías sube con una parte de lo que quemaste.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-200">Sumar ejercicio a mi meta</span>
        <button
          type="button"
          role="switch"
          aria-checked={exerciseCredit.enabled}
          onClick={setEnabled}
          className={
            'relative w-11 h-6 rounded-full transition-colors shrink-0 ' +
            (exerciseCredit.enabled ? 'bg-emerald-500' : 'bg-slate-700')
          }
        >
          <span
            className={
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ' +
              (exerciseCredit.enabled ? 'translate-x-5' : '')
            }
          />
        </button>
      </div>

      {exerciseCredit.enabled && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Porcentaje de las calorías quemadas que cuenta:</p>
          <div className="flex gap-2">
            {PERCENTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPercent(p)}
                className={
                  'flex-1 py-1.5 rounded-xl text-sm font-medium border transition-colors ' +
                  (exerciseCredit.percent === p
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600')
                }
              >
                {p}%
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Se recomienda 50%: las calorías quemadas que estiman las apps y los relojes suelen salir infladas.
          </p>
        </div>
      )}
    </div>
  );
}