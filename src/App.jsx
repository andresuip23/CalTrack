import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, addDoc, onSnapshot, query, where, 
  doc, setDoc, deleteDoc
} from 'firebase/firestore';
import { Plus, Trash2, Scale, Flame, Calendar, Settings, Search } from 'lucide-react';
import FoodSearchModal from './components/FoodSearchModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Metas del usuario
  const [goals, setGoals] = useState({ calories: 2200, protein: 160, carbs: 220, fats: 70 });
  const [userWeight, setUserWeight] = useState(75);
  
  // Registros
  const [meals, setMeals] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState([]);

  // Formulario Comida Manual
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Escuchar comidas del día de hoy
  useEffect(() => {
    const q = query(
      collection(db, 'meals'), 
      where('date', '==', todayStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMeals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedMeals.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMeals(fetchedMeals);
    });

    return () => unsubscribe();
  }, [todayStr]);

  // 2. Escuchar metas e historial del usuario
  useEffect(() => {
    const unsubscribeGoals = onSnapshot(doc(db, 'user_settings', 'profile'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.goals) setGoals(data.goals);
        if (data.weight) setUserWeight(data.weight);
      }
    });

    const unsubscribeWeekly = onSnapshot(collection(db, 'daily_summaries'), (snapshot) => {
      setWeeklyLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeGoals();
      unsubscribeWeekly();
    };
  }, []);

  // Totales calculados del día
  const totalCal = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const totalProt = meals.reduce((sum, m) => sum + Number(m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + Number(m.carbs || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + Number(m.fats || 0), 0);

  // Guardar comida manual
  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!mealName || !calories) return;

    await addDoc(collection(db, 'meals'), {
      name: mealName,
      calories: Number(calories),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fats: Number(fats || 0),
      date: todayStr,
      createdAt: new Date()
    });

    await setDoc(doc(db, 'daily_summaries', todayStr), {
      date: todayStr,
      calories: totalCal + Number(calories),
      weight: userWeight
    }, { merge: true });

    setMealName(''); setCalories(''); setProtein(''); setCarbs(''); setFats('');
  };

  // Eliminar comida
  const handleDeleteMeal = async (id) => {
    await deleteDoc(doc(db, 'meals', id));
  };

  // Actualizar Metas y Peso
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, 'user_settings', 'profile'), {
      goals,
      weight: userWeight
    }, { merge: true });
    
    await setDoc(doc(db, 'daily_summaries', todayStr), {
      weight: userWeight
    }, { merge: true });

    alert('Configuración guardada correctamente.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 md:pb-8 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Superior */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent flex items-center gap-2">
            <Flame className="text-emerald-400" /> MacroTracker
          </h1>
          <span className="text-xs text-slate-500 font-medium">{todayStr}</span>
        </header>

        {activeTab === 'daily' && (
          <>
            {/* Resumen de Calorías y Macros */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="col-span-2 md:col-span-4 bg-slate-900/60 border border-slate-800 p-5 md:p-6 rounded-2xl">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400">Consumo Diario</span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-100">
                      {totalCal} <span className="text-sm md:text-lg font-normal text-slate-400">/ {goals.calories} kcal</span>
                    </h2>
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-emerald-400">
                    {Math.max(0, goals.calories - totalCal)} kcal restantes
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (totalCal / goals.calories) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Progress Macros */}
              {[
                { label: 'Proteína', current: totalProt, target: goals.protein, color: 'bg-indigo-500' },
                { label: 'Carbos', current: totalCarbs, target: goals.carbs, color: 'bg-amber-500' },
                { label: 'Grasas', current: totalFats, target: goals.fats, color: 'bg-rose-500' },
              ].map((m) => (
                <div key={m.label} className="bg-slate-900/40 border border-slate-800/80 p-3.5 md:p-4 rounded-xl">
                  <span className="text-xs text-slate-400">{m.label}</span>
                  <div className="text-base md:text-lg font-bold my-1">
                    {m.current}g <span className="text-xs font-normal text-slate-500">/ {m.target}g</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`${m.color} h-full`} style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }} />
                  </div>
                </div>
              ))}

              <div className="bg-slate-900/40 border border-slate-800/80 p-3.5 md:p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Peso</span>
                  <div className="text-base md:text-lg font-bold">{userWeight} kg</div>
                </div>
                <Scale className="text-slate-600" size={20} />
              </div>
            </section>

            {/* Controles de Registro */}
            <div className="space-y-3">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-[0.99] text-emerald-400 text-sm font-semibold p-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Search size={18} /> Buscar alimento en la API (USDA)
              </button>

              {/* Formulario Manual Responsivo */}
              <form onSubmit={handleAddMeal} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">Registro manual rápido</span>
                <input 
                  type="text" placeholder="Nombre (ej. Huevos revueltos)" value={mealName}
                  onChange={e => setMealName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base md:text-sm focus:outline-none focus:border-emerald-500"
                />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input 
                    type="number" placeholder="Kcal" value={calories} onChange={e => setCalories(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base md:text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="number" placeholder="Prot (g)" value={protein} onChange={e => setProtein(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base md:text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="number" placeholder="Carb (g)" value={carbs} onChange={e => setCarbs(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base md:text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="number" placeholder="Grasa (g)" value={fats} onChange={e => setFats(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base md:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-500 active:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1">
                  <Plus size={18} /> Agregar
                </button>
              </form>
            </div>

            {/* Tarjetas de comidas registradas */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registros de hoy</h3>
              {meals.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm border border-dashed border-slate-800 rounded-2xl">
                  No has registrado comidas hoy.
                </div>
              ) : (
                meals.map((meal) => (
                  <div key={meal.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm md:text-base">{meal.name}</h4>
                      <div className="text-xs text-slate-400 flex gap-2 md:gap-3 mt-1">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>G: {meal.fats}g</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400 text-sm md:text-base">{meal.calories} kcal</span>
                      <button onClick={() => handleDeleteMeal(meal.id)} className="text-slate-600 hover:text-rose-400 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}

        {/* Tab: Registro Semanal */}
        {activeTab === 'weekly' && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="text-emerald-400" /> Historial Diario</h2>
            <div className="grid grid-cols-1 gap-3">
              {weeklyLogs.sort((a,b) => b.date.localeCompare(a.date)).map((log) => (
                <div key={log.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">{log.date}</div>
                    <div className="text-xs text-slate-400">Peso: {log.weight || '--'} kg</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base md:text-lg font-black text-emerald-400">{log.calories} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab: Ajustes */}
        {activeTab === 'settings' && (
          <section className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl max-w-xl mx-auto space-y-4">
            <h2 className="text-lg font-bold">Ajustar Intake y Peso</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Peso Actual (kg)</label>
                <input 
                  type="number" value={userWeight} onChange={e => setUserWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base md:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Calorías Target</label>
                  <input 
                    type="number" value={goals.calories} onChange={e => setGoals({...goals, calories: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Proteínas (g)</label>
                  <input 
                    type="number" value={goals.protein} onChange={e => setGoals({...goals, protein: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Carbohidratos (g)</label>
                  <input 
                    type="number" value={goals.carbs} onChange={e => setGoals({...goals, carbs: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Grasas (g)</label>
                  <input 
                    type="number" value={goals.fats} onChange={e => setGoals({...goals, fats: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base md:text-sm"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl transition-colors text-sm">
                Guardar Configuración
              </button>
            </form>
          </section>
        )}

      </div>

      {/* Navegación Inferior (Bottom Bar Fija) para Móviles */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-6 py-2 flex justify-around items-center z-40">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`flex flex-col items-center gap-1 text-xs font-medium py-1 ${
            activeTab === 'daily' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Flame size={20} />
          <span>Hoy</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('weekly')}
          className={`flex flex-col items-center gap-1 text-xs font-medium py-1 ${
            activeTab === 'weekly' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Calendar size={20} />
          <span>Semana</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 text-xs font-medium py-1 ${
            activeTab === 'settings' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Settings size={20} />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* Modal de Búsqueda API */}
      <FoodSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userWeight={userWeight}
        totalCalToday={totalCal}
      />
    </div>
  );
}