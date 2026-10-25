import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function usePresets(uid) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', uid, 'presets'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setPresets(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener comidas preestablecidas:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const addPreset = async (data) => {
    if (!uid) return;
    return await addDoc(collection(db, 'users', uid, 'presets'), {
      ...data,
      createdAt: new Date(),
    });
  };

  const updatePreset = async (id, data) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'presets', id), data);
  };

  const deletePreset = async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'presets', id));
  };

  return { presets, loading, addPreset, updatePreset, deletePreset };
}