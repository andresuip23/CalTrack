import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { Search, Loader2, Plus, X, ArrowLeft, Check } from 'lucide-react';

export default function FoodSearchModal({ isOpen, onClose, userWeight, totalCalToday }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado para la comida seleccionada e ingreso de gramos
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100);

  if (!isOpen) return null;

  // 1. Buscar en la API de la USDA
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSelectedFood(null);
    const apiKey = import.meta.env.VITE_USDA_API_KEY;

    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=10`
      );
      const data = await res.json();

      // Mapear nutrientes base por cada 100g
      const formatted = (data.foods || []).map((food) => {
        const nutrients = food.foodNutrients || [];

        const getNutrient = (id) => {
          const item = nutrients.find((n) => n.nutrientId === id);
          return item ? item.value : 0; // Guardamos el valor exacto flotante para hacer cálculos precisos
        };

        return {
          id: food.fdcId,
          name: food.description,
          // IDs USDA: 1008 (Kcal), 1003 (Proteína), 1005 (Carbos), 1004 (Grasas)
          caloriesPer100g: getNutrient(1008),
          proteinPer100g: getNutrient(1003),
          carbsPer100g: getNutrient(1005),
          fatsPer100g: getNutrient(1004),
        };
      });

      setResults(formatted);
    } catch (err) {
      console.error('Error al consultar la USDA:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Calcular los valores según los gramos ingresados
  const portionRatio = (Number(grams) || 0) / 100;
  
  const calculatedMacros = selectedFood ? {
    calories: Math.round(selectedFood.caloriesPer100g * portionRatio),
    protein: Math.round(selectedFood.proteinPer100g * portionRatio),
    carbs: Math.round(selectedFood.carbsPer100g * portionRatio),
    fats: Math.round(selectedFood.fatsPer100g * portionRatio),
  } : null;

  // 3. Confirmar y guardar en Firestore
  const handleSaveMeal = async () => {
    if (!selectedFood || grams <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Guardar comida en Firestore con el peso especificado
    await addDoc(collection(db, 'meals'), {
      name: `${selectedFood.name} (${grams}g)`,
      calories: calculatedMacros.calories,
      protein: calculatedMacros.protein,
      carbs: calculatedMacros.carbs,
      fats: calculatedMacros.fats,
      date: todayStr,
      createdAt: new Date(),
    });

    // Actualizar el resumen diario acumulado
    await setDoc(
      doc(db, 'daily_summaries', todayStr),
      {
        date: todayStr,
        calories: totalCalToday + calculatedMacros.calories,
        weight: userWeight,
      },
      { merge: true }
    );

    // Limpiar y cerrar
    setSelectedFood(null);
    setGrams(100);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          {selectedFood ? (
            <button 
              onClick={() => setSelectedFood(null)} 
              className="text-slate-400 hover:text-slate-100 flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft size={18} /> Volver
            </button>
          ) : (
            <h3 className="font-bold text-slate-100 text-lg">Buscar Alimento (USDA API)</h3>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Vista 1: Formulario de Búsqueda y Resultados */}
        {!selectedFood ? (
          <>
            <form onSubmit={handleSearch} className="p-4 border-b border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ej: chicken and rice, oats, steak..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                Buscar
              </button>
            </form>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {results.length === 0 && !loading && (
                <p className="text-slate-500 text-center text-sm py-6">
                  Escribe el alimento en inglés para ajustar el gramaje y calcular macros.
                </p>
              )}

              {results.map((food) => (
                <div
                  key={food.id}
                  className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex justify-between items-center hover:border-slate-700 transition-colors"
                >
                  <div className="max-w-[70%]">
                    <h4 className="font-semibold text-slate-200 text-sm truncate">{food.name}</h4>
                    <div className="text-xs text-slate-400 flex gap-3 mt-1">
                      <span>P: {Math.round(food.proteinPer100g)}g</span>
                      <span>C: {Math.round(food.carbsPer100g)}g</span>
                      <span>G: {Math.round(food.fatsPer100g)}g</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400 text-sm">
                      {Math.round(food.caloriesPer100g)} <span className="text-[10px] text-slate-500 font-normal">/100g</span>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFood(food);
                        setGrams(100);
                      }}
                      className="bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 p-2 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Vista 2: Ajuste de Gramos y Confirmación */
          <div className="p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase text-emerald-400 tracking-wider">Alimento Seleccionado</span>
              <h4 className="text-xl font-bold text-slate-100 mt-1">{selectedFood.name}</h4>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <label className="block text-xs text-slate-400 font-medium">Ingresa la cantidad consumida (en gramos):</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-lg font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-400 font-semibold text-sm">gramos</span>
              </div>
            </div>

            {/* Macros Recalculados */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Calorías</span>
                <span className="text-lg font-bold text-emerald-400">{calculatedMacros.calories}</span>
                <span className="text-[10px] text-slate-500 block">kcal</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Proteínas</span>
                <span className="text-lg font-bold text-indigo-400">{calculatedMacros.protein}</span>
                <span className="text-[10px] text-slate-500 block">g</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Carbos</span>
                <span className="text-lg font-bold text-amber-400">{calculatedMacros.carbs}</span>
                <span className="text-[10px] text-slate-500 block">g</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Grasas</span>
                <span className="text-lg font-bold text-rose-400">{calculatedMacros.fats}</span>
                <span className="text-[10px] text-slate-500 block">g</span>
              </div>
            </div>

            <button
              onClick={handleSaveMeal}
              disabled={!grams || grams <= 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Check size={18} /> Registros {grams}g en el Día
            </button>
          </div>
        )}

      </div>
    </div>
  );
}