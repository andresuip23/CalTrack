import { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const round1 = (n) => Math.round(Number(n || 0) * 10) / 10;

export function useDailySummaries(uid) {
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', uid, 'daily_summaries'),
      (snapshot) => {
        setWeeklyLogs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener resúmenes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // totals: { calories, protein, carbs, fats, burned, minutes }
  const updateDailySummary = async (dateStr, totals, weight) => {
    if (!uid) return;
    await setDoc(
      doc(db, 'users', uid, 'daily_summaries', dateStr),
      {
        date: dateStr,
        calories: Math.round(Number(totals.calories || 0)),
        protein: round1(totals.protein),
        carbs: round1(totals.carbs),
        fats: round1(totals.fats),
        burned: Math.round(Number(totals.burned || 0)),
        exerciseMinutes: Math.round(Number(totals.minutes || 0)),
        weight: weight,
      },
      { merge: true }
    );
  };

  return { weeklyLogs, loading, updateDailySummary };
}