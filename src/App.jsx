import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { AccountBanner } from './components/daily/AccountBanner';
import { DailySummary } from './components/daily/DailySummary';
import { WorkoutCard } from './components/daily/WorkoutCard';
import { SlotSelector } from './components/daily/SlotSelector';
import { MealForm } from './components/daily/MealForm';
import { MealListBySlot } from './components/daily/MealListBySlot';
import { PresetsTab } from './components/presets/PresetsTab';
import { ProgressCharts } from './components/weekly/ProgressCharts';
import { HistoryList } from './components/weekly/HistoryList';
import { SettingsForm } from './components/settings/SettingsForm';
import { AccountCard } from './components/settings/AccountCard';
import { ExerciseSettings } from './components/settings/ExerciseSettings';
import { MealSlotsEditor } from './components/settings/MealSlotsEditor';
import { FoodSearchModal } from './components/modal/FoodSearchModal';

function MainContent() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 md:pb-8 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Header />

        {activeTab === 'daily' && (
          <>
            <AccountBanner />
            <DailySummary />
            <WorkoutCard />
            <SlotSelector />
            <MealForm />
            <MealListBySlot />
          </>
        )}

        {activeTab === 'presets' && <PresetsTab />}

        {activeTab === 'weekly' && (
          <>
            <ProgressCharts />
            <HistoryList />
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <AccountCard />
            <SettingsForm />
            <ExerciseSettings />
            <MealSlotsEditor />
          </>
        )}
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