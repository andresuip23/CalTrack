import React, { useState } from 'react';
import { LogIn, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export function AccountBanner() {
  const {
    isAnonymous,
    signInWithGoogle,
    authBusy,
    authError,
    authNotice,
    clearAuthMessages,
  } = useApp();
  const [dismissed, setDismissed] = useState(false);

  const showPrompt = isAnonymous && !dismissed;
  if (!authError && !authNotice && !showPrompt) return null;

  return (
    <div className="space-y-3">
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

      {showPrompt && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-amber-100">
              Tus datos solo están en este navegador. Guárdalos con Google para no perderlos y usarlos en otros dispositivos.
            </p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-amber-200/70 hover:text-amber-100 shrink-0"
              aria-label="Ocultar aviso"
            >
              <X size={16} />
            </button>
          </div>
          <Button onClick={signInWithGoogle} disabled={authBusy} className="w-full">
            <LogIn size={16} /> {authBusy ? 'Abriendo Google...' : 'Continuar con Google'}
          </Button>
        </div>
      )}
    </div>
  );
}