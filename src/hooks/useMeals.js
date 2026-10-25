import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useMeals(uid, todayStr) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !todayStr) return;

    const q = query(
      collection(db, 'users', uid, 'meals'),
      where('date', '==', todayStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMeals(fetched);
      setLoading(false);
    }, (error) => {
      console.error('Error al obtener comidas:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid, todayStr]);

  const addMeal = async (mealData) => {
    if (!uid) return;
    return await addDoc(collection(db, 'users', uid, 'meals'), {
      ...mealData,
      date: todayStr,
      createdAt: new Date()
    });
  };

  const deleteMeal = async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'meals', id));
  };

  return { meals, loading, addMeal, deleteMeal };
}