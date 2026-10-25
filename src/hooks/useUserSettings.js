import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const DEFAULT_MEAL_SLOTS = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'dinner', name: 'Cena' },
  { id: 'snack', name: 'Snack' },
];

export const DEFAULT_EXERCISE_CREDIT = { enabled: true, percent: 50 };

export function useUserSettings(uid) {
  const [goals, setGoals] = useState({ calories: 2200, protein: 160, carbs: 220, fats: 70 });
  const [userWeight, setUserWeight] = useState(75);
  const [mealSlots, setMealSlots] = useState(DEFAULT_MEAL_SLOTS);
  const [exerciseCredit, setExerciseCredit] = useState(DEFAULT_EXERCISE_CREDIT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', uid, 'settings', 'profile'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.goals) setGoals(data.goals);
          if (data.weight) setUserWeight(data.weight);
          if (Array.isArray(data.mealSlots) && data.mealSlots.length > 0) {
            setMealSlots(data.mealSlots);
          }
          if (data.exerciseCredit) {
            setExerciseCredit({ ...DEFAULT_EXERCISE_CREDIT, ...data.exerciseCredit });
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener ajustes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const updateSettings = async (newGoals, newWeight, todayStr) => {
    if (!uid) return;
    await setDoc(
      doc(db, 'users', uid, 'settings', 'profile'),
      { goals: newGoals, weight: newWeight },
      { merge: true }
    );

    if (todayStr) {
      await setDoc(
        doc(db, 'users', uid, 'daily_summaries', todayStr),
        { weight: newWeight },
        { merge: true }
      );
    }
  };

  const updateMealSlots = async (slots) => {
    if (!uid) return;
    await setDoc(
      doc(db, 'users', uid, 'settings', 'profile'),
      { mealSlots: slots },
      { merge: true }
    );
  };

  const updateExerciseCredit = async (credit) => {
    if (!uid) return;
    await setDoc(
      doc(db, 'users', uid, 'settings', 'profile'),
      { exerciseCredit: credit },
      { merge: true }
    );
  };

  return {
    goals,
    userWeight,
    mealSlots,
    exerciseCredit,
    loading,
    updateSettings,
    updateMealSlots,
    updateExerciseCredit,
  };
}