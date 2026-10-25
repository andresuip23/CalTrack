import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const MAX_NAME = 200;
const MAX_KCAL = 20000;
const MAX_MACRO = 5000;
const r1 = (n) => Math.round(n * 10) / 10;

export function MealForm() {
  const { handleAddMeal, setIsSearchOpen } = useApp();

  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = mealName.trim();
    const kcal = Number(calories);
    const prot = Number(protein || 0);
    const carb = Number(carbs || 0);
    const fat = Number(fats || 0);

    if (!name || calories === '') {
      setError('Escribe el nombre y las calorías.');
      return;
    }
    if (name.length > MAX_NAME) {
      setError(`El nombre es muy largo (máximo ${MAX_NAME} caracteres).`);
      return;
    }
    if (![kcal, prot, carb, fat].every(Number.isFinite)) {
      setError('Revisa los números: hay un valor que no es válido.');
      return;
    }
    if ([kcal, prot, carb, fat].some((n) => n < 0)) {
      setError('Los valores no pueden ser negativos.');
      return;
    }
    if (kcal > MAX_KCAL || [prot, carb, fat].some((n) => n > MAX_MACRO)) {
      setError(`Valor demasiado alto (máximo ${MAX_KCAL} kcal y ${MAX_MACRO} g por macro).`);
      return;
    }

    setSaving(true);
    try {
      await handleAddMeal({
        name,
        calories: Math.round(kcal),
        protein: r1(prot),
        carbs: r1(carb),
        fats: r1(fat),
      });

      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
    } catch (err) {
      console.error('Error al guardar la comida:', err);
      setError('No se pudo guardar la comida. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button variant="secondary" className="w-full" onClick={() => setIsSearchOpen(true)}>
        <Search size={18} /> Buscar alimento en la API (USDA)
      </Button>

      <form onSubmit={onSubmit} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
        <span className="text-xs font-semibold text-slate-400 block">Registro manual rápido</span>
        <Input
          type="text"
          maxLength={MAX_NAME}
          placeholder="Nombre (ej. Huevos revueltos)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Input type="number" min="0" step="any" placeholder="Kcal" value={calories} onChange={(e) => setCalories(e.target.value)} />
          <Input type="number" min="0" step="any" placeholder="Prot (g)" value={protein} onChange={(e) => setProtein(e.target.value)} />
          <Input type="number" min="0" step="any" placeholder="Carb (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          <Input type="number" min="0" step="any" placeholder="Grasa (g)" value={fats} onChange={(e) => setFats(e.target.value)} />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full">
          <Plus size={18} /> {saving ? 'Guardando...' : 'Agregar'}
        </Button>
      </form>
    </div>
  );
}