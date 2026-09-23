import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function MealForm() {
  const { handleAddMeal, setIsSearchOpen } = useApp();

  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!mealName || !calories) return;

    await handleAddMeal({
      name: mealName,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fats: Number(fats || 0),
    });

    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
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
          placeholder="Nombre (ej. Huevos revueltos)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Input type="number" placeholder="Kcal" value={calories} onChange={(e) => setCalories(e.target.value)} />
          <Input type="number" placeholder="Prot (g)" value={protein} onChange={(e) => setProtein(e.target.value)} />
          <Input type="number" placeholder="Carb (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          <Input type="number" placeholder="Grasa (g)" value={fats} onChange={(e) => setFats(e.target.value)} />
        </div>

        <Button type="submit" className="w-full">
          <Plus size={18} /> Agregar
        </Button>
      </form>
    </div>
  );
}