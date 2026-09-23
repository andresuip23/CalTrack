import React from 'react';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50';
  
  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 px-4 text-sm',
    secondary: 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 py-3.5 px-4 text-sm',
    ghost: 'p-2 text-slate-600 hover:text-rose-400',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}