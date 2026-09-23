import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useMeals(todayStr) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!todayStr) return;

    const q = query(
      collection(db, 'meals'),
      where('date', '==', todayStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMeals = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      fetchedMeals.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMeals(fetchedMeals);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener comidas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [todayStr]);

  const addMeal = async (mealData) => {
    return await addDoc(collection(db, 'meals'), {
      ...mealData,
      date: todayStr,
      createdAt: new Date()
    });
  };

  const deleteMeal = async (id) => {
    await deleteDoc(doc(db, 'meals', id));
  };

  return { meals, loading, addMeal, deleteMeal };
}