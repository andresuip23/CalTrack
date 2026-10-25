import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SlotSelector } from '../daily/SlotSelector';

const EMPTY_FORM = { name: '', calories: '', protein: '', carbs: '', fats: '' };
const fmt = (n) => Math.round(Number(n || 0) * 10) / 10;

export function PresetsTab() {
  const {
    presets,
    loadingPresets,
    addPreset,
    updatePreset,
    deletePreset,
    handleAddMeal,
    mealSlots,
    currentSlotId,
  } = useApp();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addedId, setAddedId] = useState(null);

  const currentSlot = mealSlots.find((s) => s.id === currentSlotId);

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const canSave = form.name.trim() !== '' && form.calories !== '' && Number(form.calories) >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    const data = {
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fats: Number(form.fats) || 0,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updatePreset(editingId, data);
      } else {
        await addPreset(data);
      }
      resetForm();
    } catch (err) {
      console.error('Error al guardar comida preestablecida:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (preset) => {
    setEditingId(preset.id);
    setForm({
      name: preset.name || '',
      calories: String(preset.calories ?? ''),
      protein: String(preset.protein ?? ''),
      carbs: String(preset.carbs ?? ''),
      fats: String(preset.fats ?? ''),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (preset) => {
    if (!window.confirm(`¿Borrar "${preset.name}"?`)) return;
    await deletePreset(preset.id);
    if (editingId === preset.id) resetForm();
  };

  const handleRegister = async (preset) => {
    await handleAddMeal({
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fats: preset.fats,
    });
    setAddedId(preset.id);
    setTimeout(() => setAddedId((cur) => (cur === preset.id ? null : cur)), 1500);
  };

  return (
    <div className="space-y-6">
      <SlotSelector label="Las comidas que registres desde aquí irán a:" />

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4"
      >
        <h3 className="font-bold text-slate-100">
          {editingId ? 'Editar comida' : 'Crear comida preestablecida'}
        </h3>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Nombre</label>
          <Input
            type="text"
            placeholder="Ej. Avena con banano"
            value={form.name}
            onChange={setField('name')}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Calorías (kcal)</label>
            <Input type="number" min="0" value={form.calories} onChange={setField('calories')} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Proteína (g)</label>
            <Input type="number" min="0" step="0.1" value={form.protein} onChange={setField('protein')} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Carbohidratos (g)</label>
            <Input type="number" min="0" step="0.1" value={form.carbs} onChange={setField('carbs')} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Grasas (g)</label>
            <Input type="number" min="0" step="0.1" value={form.fats} onChange={setField('fats')} className="w-full" />
          </div>
        </div>

        <div className="flex gap-2">
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm} className="flex-1 border border-slate-800">
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={!canSave || saving} className="flex-1">
            <Plus size={16} /> {editingId ? 'Guardar cambios' : 'Guardar comida'}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-100">Mis comidas</h3>

        {loadingPresets && (
          <p className="text-center text-xs text-slate-500 py-4">Cargando...</p>
        )}

        {!loadingPresets && presets.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-6">
            Aún no has creado comidas. Crea la primera con el formulario de arriba.
          </p>
        )}

        {presets.map((preset) => (
          <div
            key={preset.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-100 truncate">{preset.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {Math.round(Number(preset.calories || 0))} kcal | P: {fmt(preset.protein)}g | C: {fmt(preset.carbs)}g | G: {fmt(preset.fats)}g
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(preset)}
                className="p-2 text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="Editar"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(preset)}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                aria-label="Borrar"
              >
                <Trash2 size={16} />
              </button>
              <Button onClick={() => handleRegister(preset)}>
                {addedId === preset.id ? (
                  <>
                    <Check size={16} /> Añadido
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Añadir a {currentSlot?.name || 'hoy'}
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}