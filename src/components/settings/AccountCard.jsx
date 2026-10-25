import React from 'react';
import { LogIn, LogOut, ShieldCheck, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export function AccountCard() {
  const {
    user,
    isAnonymous,
    signInWithGoogle,
    signOutUser,
    authBusy,
    authError,
    authNotice,
    clearAuthMessages,
  } = useApp();

  const handleSignOut = async () => {
    const ok = window.confirm(
      '¿Cerrar sesión? Tus datos quedan guardados en tu cuenta de Google y los recuperas al volver a entrar.'
    );
    if (!ok) return;
    await signOutUser();
  };

  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <h3 className="font-bold text-slate-100">Cuenta</h3>

      {authError && (
        <div className="flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/40 text-red-300 text-xs rounded-xl p-3">
          <span>{authError}</span>
          <button type="button" onClick={clearAuthMessages} aria-label="Cerrar aviso">
            <X size={14} />
          </button>
        </div>
      )}

      {authNotice && (
        <div className="flex items-start justify-between gap-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl p-3">
          <span>{authNotice}</span>
          <button type="button" onClick={clearAuthMessages} aria-label="Cerrar aviso">
            <X size={14} />
          </button>
        </div>
      )}

      {isAnonymous ? (
        <>
          <div className="flex items-start gap-3 text-sm text-slate-300">
            <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <p>
              Estás usando la app sin cuenta. Tus datos están guardados solo en este navegador:
              si borras los datos del sitio o cambias de dispositivo, los pierdes.
            </p>
          </div>

          <Button onClick={signInWithGoogle} disabled={authBusy} className="w-full">
            <LogIn size={16} /> {authBusy ? 'Abriendo Google...' : 'Continuar con Google'}
          </Button>

          <p className="text-xs text-slate-500">
            Si ya usaste la app en otro dispositivo con Google, entra con ese mismo botón y verás tus datos de allá.
            Lo que hayas registrado aquí sin vincular no se combina con esa cuenta.
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user.displayName || 'Cuenta de Google'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <p>Tus datos están guardados en tu cuenta y los verás en cualquier dispositivo donde inicies sesión.</p>
          </div>

          <Button variant="ghost" onClick={handleSignOut} className="w-full border border-slate-800">
            <LogOut size={16} /> Cerrar sesión
          </Button>
        </>
      )}
    </div>
  );
}