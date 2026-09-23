import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DailySummary } from './components/daily/DailySummary';
import { MealForm } from './components/daily/MealForm';
import { MealList } from './components/daily/MealList';
import { HistoryList } from './components/weekly/HistoryList';
import { SettingsForm } from './components/settings/SettingsForm';
import { FoodSearchModal } from './components/modal/FoodSearchModal';

function MainContent() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 md:pb-8 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Header />

        {activeTab === 'daily' && (
          <>
            <DailySummary />
            <MealForm />
            <MealList />
          </>
        )}

        {activeTab === 'weekly' && <HistoryList />}

        {activeTab === 'settings' && <SettingsForm />}
      </div>

      <BottomNav />
      <FoodSearchModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}