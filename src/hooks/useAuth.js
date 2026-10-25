import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  linkWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';

// Datos simples del usuario (objeto nuevo en cada cambio para que React re-renderice)
function toUserInfo(u) {
  const provider = u.providerData?.[0];
  return {
    uid: u.uid,
    isAnonymous: u.isAnonymous,
    displayName: u.displayName || provider?.displayName || '',
    email: u.email || provider?.email || '',
    photoURL: u.photoURL || provider?.photoURL || '',
  };
}

// Devuelve null cuando el usuario solo cerró la ventana (no hay que mostrar error)
function friendlyError(err) {
  switch (err?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.';
    case 'auth/operation-not-allowed':
      return 'El inicio de sesión con Google no está activado. Actívalo en Firebase Console → Authentication → Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado. Agrégalo en Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/network-request-failed':
      return 'No hay conexión a internet. Revísala e inténtalo de nuevo.';
    default:
      return 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(toUserInfo(u));
        setLoading(false);
      } else {
        // Sin sesión (primera vez o después de cerrar sesión): entra como anónimo
        setUser(null);
        setLoading(true);
        signInAnonymously(auth).catch((e) => {
          console.error('Error de autenticación:', e);
          setAuthError('No se pudo iniciar la sesión anónima.');
          setLoading(false);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setAuthNotice(null);
    setBusy(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const current = auth.currentUser;

      if (current && current.isAnonymous) {
        try {
          // Vincula Google al usuario actual: mismo uid, no se pierde ningún dato
          await linkWithPopup(current, provider);
          await auth.currentUser.reload();
          setUser(toUserInfo(auth.currentUser));
          setAuthNotice('Listo: tu cuenta quedó vinculada con Google y tus datos se conservaron.');
        } catch (err) {
          if (err.code === 'auth/credential-already-in-use') {
            // Esa cuenta de Google ya tenía datos (por ejemplo, de otro dispositivo): entra a ella
            const credential = GoogleAuthProvider.credentialFromError(err);
            if (!credential) throw err;
            await signInWithCredential(auth, credential);
            setAuthNotice(
              'Entraste a tu cuenta existente de Google. Lo que habías registrado en este navegador sin vincular no se combina con ella.'
            );
          } else {
            throw err;
          }
        }
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (err) {
      console.error('Error con Google:', err);
      const message = friendlyError(err);
      if (message) setAuthError(message);
    } finally {
      setBusy(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    setAuthNotice(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setAuthError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    }
  }, []);

  const clearAuthMessages = useCallback(() => {
    setAuthError(null);
    setAuthNotice(null);
  }, []);

  return {
    user,
    loading,
    busy,
    authError,
    authNotice,
    signInWithGoogle,
    signOutUser,
    clearAuthMessages,
  };
}