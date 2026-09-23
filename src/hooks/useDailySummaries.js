import { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useDailySummaries() {
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'daily_summaries'), (snapshot) => {
      const logs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setWeeklyLogs(logs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateDailySummary = async (dateStr, totalCalories, weight) => {
    await setDoc(doc(db, 'daily_summaries', dateStr), {
      date: dateStr,
      calories: totalCalories,
      weight: weight
    }, { merge: true });
  };

  return { weeklyLogs, loading, updateDailySummary };
}