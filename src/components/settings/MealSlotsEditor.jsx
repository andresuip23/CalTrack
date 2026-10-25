import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const SUGGESTIONS = ['Media mañana', 'Snack pre entreno', 'Snack post entreno', 'Merienda'];

const newId = () => `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export function MealSlotsEditor() {
  const { mealSlots, updateMealSlots } = useApp();

  const [draft, setDraft] = useState(mealSlots);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(mealSlots);
  }, [mealSlots]);

  const rename = (id, name) =>
    setDraft((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));

  const remove = (id) =>
    setDraft((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));

  const move = (index, dir) =>
    setDraft((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const add = (name = '') => setDraft((prev) => [...prev, { id: newId(), name }]);

  const cleaned = draft
    .map((s) => ({ ...s, name: s.name.trim() }))
    .filter((s) => s.name !== '');

  const dirty = JSON.stringify(cleaned) !== JSON.stringify(mealSlots);
  const canSave = cleaned.length > 0 && dirty;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await updateMealSlots(cleaned);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error al guardar las comidas del día:', err);
    } finally {
      setSaving(false);
    }
  };

  const existingNames = draft.map((s) => s.name.trim().toLowerCase());
  const availableSuggestions = SUGGESTIONS.filter((s) => !existingNames.includes(s.toLowerCase()));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="font-bold text-slate-100">Comidas del día</h3>
        <p className="text-xs text-slate-400 mt-1">
          Configura cuántas veces comes al día y cómo se llama cada una ({draft.length} actualmente).
          Si borras una, las comidas de hoy que tenía pasan a "Sin clasificar".
        </p>
      </div>

      <div className="space-y-2">
        {draft.map((slot, index) => (
          <div key={slot.id} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Nombre de la comida"
              value={slot.name}
              onChange={(e) => rename(slot.id, e.target.value)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              className="p-2 text-slate-500 hover:text-slate-200 disabled:opacity-30 transition-colors"
              aria-label="Subir"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === draft.length - 1}
              className="p-2 text-slate-500 hover:text-slate-200 disabled:opacity-30 transition-colors"
              aria-label="Bajar"
            >
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              onClick={() => remove(slot.id)}
              disabled={draft.length <= 1}
              className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
              aria-label="Borrar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={() => add('')} className="border border-slate-800">
          <Plus size={16} /> Añadir comida
        </Button>
        {availableSuggestions.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => add(name)}
            className="px-3 py-1.5 rounded-full text-xs border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600 transition-colors"
          >
            + {name}
          </button>
        ))}
      </div>

      <Button onClick={handleSave} disabled={!canSave || saving} className="w-full">
        {saved ? 'Guardado ✓' : saving ? 'Guardando...' : 'Guardar comidas del día'}
      </Button>
    </div>
  );
}