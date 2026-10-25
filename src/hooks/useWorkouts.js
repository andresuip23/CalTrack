import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useWorkouts(uid, todayStr) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !todayStr) return;

    const q = query(
      collection(db, 'users', uid, 'workouts'),
      where('date', '==', todayStr)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setWorkouts(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener entrenamientos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, todayStr]);

  const addWorkout = async (data) => {
    if (!uid) return;
    return await addDoc(collection(db, 'users', uid, 'workouts'), {
      ...data,
      date: todayStr,
      createdAt: new Date(),
    });
  };

  const deleteWorkout = async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'workouts', id));
  };

  return { workouts, loading, addWorkout, deleteWorkout };
}