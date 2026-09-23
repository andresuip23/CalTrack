import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function FoodSearchModal() {
  const { isSearchOpen, setIsSearchOpen, handleAddMeal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100);

  if (!isSearchOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&pageSize=5`
      );
      const data = await res.json();

      if (data.foods) {
        const parsed = data.foods.map((food) => {
          const getNutrient = (id) => {
            const n = food.foodNutrients?.find((item) => item.nutrientId === id);
            return n ? n.value : 0;
          };

          return {
            id: food.fdcId,
            name: food.description,
            calories: getNutrient(1008),
            protein: getNutrient(1003),
            carbs: getNutrient(1005),
            fats: getNutrient(1004),
          };
        });
        setResults(parsed);
      }
    } catch (err) {
      console.error('Error al buscar en USDA:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMacros = (food, g) => {
    const factor = g / 100;
    return {
      calories: Math.round(food.calories * factor),
      protein: Math.round(food.protein * factor),
      carbs: Math.round(food.carbs * factor),
      fats: Math.round(food.fats * factor),
    };
  };

  const onConfirm = async () => {
    if (!selectedFood) return;

    const computed = calculateMacros(selectedFood, grams);

    await handleAddMeal({
      name: `${selectedFood.name} (${grams}g)`,
      calories: computed.calories,
      protein: computed.protein,
      carbs: computed.carbs,
      fats: computed.fats,
    });

    setSelectedFood(null);
    setGrams(100);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-100">Buscar Alimento (USDA)</h3>
          <Button variant="ghost" onClick={() => setIsSearchOpen(false)} className="p-1">
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ej. Chicken breast, Oatmeal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search size={18} />
          </Button>
        </form>

        {loading && <p className="text-center text-xs text-slate-500 py-4">Buscando alimento...</p>}

        {!selectedFood ? (
          <div className="space-y-2">
            {results.map((food) => (
              <div
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-colors"
              >
                <p className="font-semibold text-sm text-slate-200">{food.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  100g = {Math.round(food.calories)} kcal | P: {Math.round(food.protein)}g | C: {Math.round(food.carbs)}g | G: {Math.round(food.fats)}g
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-sm text-emerald-400">{selectedFood.name}</h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cantidad en gramos (g):</label>
              <Input
                type="number"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {(() => {
              const computed = calculateMacros(selectedFood, grams);
              return (
                <div className="text-xs text-slate-300 flex justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span><strong>{computed.calories}</strong> kcal</span>
                  <span>P: {computed.protein}g</span>
                  <span>C: {computed.carbs}g</span>
                  <span>G: {computed.fats}g</span>
                </div>
              );
            })()}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelectedFood(null)} className="flex-1 border border-slate-800">
                Atrás
              </Button>
              <Button onClick={onConfirm} className="flex-1">
                <Plus size={16} /> Añadir
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}