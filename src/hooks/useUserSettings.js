import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useUserSettings() {
  const [goals, setGoals] = useState({ calories: 2200, protein: 160, carbs: 220, fats: 70 });
  const [userWeight, setUserWeight] = useState(75);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'user_settings', 'profile'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.goals) setGoals(data.goals);
        if (data.weight) setUserWeight(data.weight);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newGoals, newWeight, todayStr) => {
    await setDoc(doc(db, 'user_settings', 'profile'), {
      goals: newGoals,
      weight: newWeight
    }, { merge: true });

    if (todayStr) {
      await setDoc(doc(db, 'daily_summaries', todayStr), {
        weight: newWeight
      }, { merge: true });
    }
  };

  return { goals, userWeight, loading, updateSettings };
}