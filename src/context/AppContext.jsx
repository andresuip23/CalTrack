import React, { createContext, useContext, useState } from 'react';
import { useMeals } from '../hooks/useMeals';
import { useUserSettings } from '../hooks/useUserSettings';
import { useDailySummaries } from '../hooks/useDailySummaries';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const { meals, loading: loadingMeals, addMeal, deleteMeal } = useMeals(todayStr);
  const { goals, userWeight, loading: loadingSettings, updateSettings } = useUserSettings();
  const { weeklyLogs, loading: loadingSummaries, updateDailySummary } = useDailySummaries();

  // Totales calculados
  const totalCal = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const totalProt = meals.reduce((sum, m) => sum + Number(m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + Number(m.carbs || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + Number(m.fats || 0), 0);

  const handleAddMeal = async (mealData) => {
    await addMeal(mealData);
    const newTotalCal = totalCal + Number(mealData.calories);
    await updateDailySummary(todayStr, newTotalCal, userWeight);
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}