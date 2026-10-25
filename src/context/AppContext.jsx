import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMeals } from '../hooks/useMeals';
import { useUserSettings } from '../hooks/useUserSettings';
import { useDailySummaries } from '../hooks/useDailySummaries';
import { usePresets } from '../hooks/usePresets';
import { useWorkouts } from '../hooks/useWorkouts';

const AppContext = createContext();

function Splash({ message, detail }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-slate-300">{message}</p>
      {detail && <p className="text-xs text-slate-500 max-w-sm">{detail}</p>}
    </div>
  );
}

// Todo el estado de datos vive aquí. Se vuelve a crear desde cero cuando cambia
// el usuario (iniciar o cerrar sesión), así nunca se mezclan datos de dos cuentas.
function DataProvider({ auth, children }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState(null);

  const uid = auth.user.uid;

  // Fecha local (toISOString usaba UTC y desde las 7 p.m. caía en el día siguiente)
  const todayStr = new Date().toLocaleDateString('en-CA');

  const { meals, loading: loadingMeals, addMeal, deleteMeal } = useMeals(uid, todayStr);
  const {
    goals,
    userWeight,
    mealSlots,
    exerciseCredit,
    loading: loadingSettings,
    updateSettings,
    updateMealSlots,
    updateExerciseCredit,
  } = useUserSettings(uid);
  const { weeklyLogs, loading: loadingSummaries, updateDailySummary } = useDailySummaries(uid);
  const {
    presets,
    loading: loadingPresets,
    addPreset,
    updatePreset,
    deletePreset,
  } = usePresets(uid);
  const {
    workouts,
    loading: loadingWorkouts,
    addWorkout,
    deleteWorkout,
  } = useWorkouts(uid, todayStr);

  // Comida seleccionada: si la elegida ya no existe, usa la primera
  const currentSlotId = mealSlots.some((s) => s.id === activeSlotId)
    ? activeSlotId
    : mealSlots[0]?.id;

  // Totales de comida
  const totalCal = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const totalProt = meals.reduce((sum, m) => sum + Number(m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + Number(m.carbs || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + Number(m.fats || 0), 0);

  // Totales de ejercicio
  const totalBurned = workouts.reduce((sum, w) => sum + Number(w.calories || 0), 0);
  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + Number(w.minutes || 0), 0);

  // Calorías extra que se suman a la meta según tus Ajustes
  const creditedCalories = exerciseCredit.enabled
    ? Math.round((totalBurned * exerciseCredit.percent) / 100)
    : 0;
  const effectiveCalGoal = Number(goals.calories || 0) + creditedCalories;

  // Mantiene el resumen diario sincronizado al agregar o borrar comidas y entrenamientos
  useEffect(() => {
    if (!uid || loadingMeals || loadingSettings || loadingWorkouts) return;
    updateDailySummary(
      todayStr,
      {
        calories: totalCal,
        protein: totalProt,
        carbs: totalCarbs,
        fats: totalFats,
        burned: totalBurned,
        minutes: totalWorkoutMinutes,
      },
      userWeight
    );
  }, [
    uid,
    todayStr,
    totalCal,
    totalProt,
    totalCarbs,
    totalFats,
    totalBurned,
    totalWorkoutMinutes,
    userWeight,
    loadingMeals,
    loadingSettings,
    loadingWorkouts,
  ]);

  // Toda comida nueva se guarda en la comida del día seleccionada
  const handleAddMeal = async (mealData) => {
    await addMeal({ ...mealData, slot: mealData.slot ?? currentSlotId });
  };

  const handleSaveSettings = async (newGoals, newWeight) => {
    await updateSettings(newGoals, newWeight, todayStr);
  };

  const value = {
    todayStr,
    activeTab,
    setActiveTab,
    isSearchOpen,
    setIsSearchOpen,
    // Cuenta
    user: auth.user,
    isAnonymous: auth.user.isAnonymous,
    loadingAuth: false,
    signInWithGoogle: auth.signInWithGoogle,
    signOutUser: auth.signOutUser,
    authBusy: auth.busy,
    authError: auth.authError,
    authNotice: auth.authNotice,
    clearAuthMessages: auth.clearAuthMessages,
    // Comidas
    meals,
    loadingMeals,
    handleAddMeal,
    deleteMeal,
    goals,
    userWeight,
    loadingSettings,
    handleSaveSettings,
    weeklyLogs,
    loadingSummaries,
    totalCal,
    totalProt,
    totalCarbs,
    totalFats,
    // Comidas del día (desayuno, almuerzo, etc.)
    mealSlots,
    updateMealSlots,
    currentSlotId,
    setActiveSlotId,
    // Comidas preestablecidas
    presets,
    loadingPresets,
    addPreset,
    updatePreset,
    deletePreset,
    // Ejercicio
    workouts,
    loadingWorkouts,
    addWorkout,
    deleteWorkout,
    totalBurned,
    totalWorkoutMinutes,
    exerciseCredit,
    updateExerciseCredit,
    creditedCalories,
    effectiveCalGoal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }) {
  const auth = useAuth();

  if (auth.loading) {
    return <Splash message="Cargando..." />;
  }

  if (!auth.user) {
    return (
      <Splash
        message="No se pudo iniciar la sesión"
        detail={
          auth.authError ||
          'Revisa que la autenticación anónima esté activada en Firebase y recarga la página.'
        }
      />
    );
  }

  // La key reinicia todo el estado cuando cambia el usuario
  return (
    <DataProvider key={auth.user.uid} auth={auth}>
      {children}
    </DataProvider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}