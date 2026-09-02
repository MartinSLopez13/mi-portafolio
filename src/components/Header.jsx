import React from 'react';
import logoImg from '../assets/logo.png'; 

export const Header = ({ cartCount, onOpenCart, user, onOpenLogin, onLogout }) => {
  return (
    /* Fondo más oscuro (emerald-950) con borde inferior ámbar para dar contraste con el Hero */
    <header className="bg-emerald-950/95 text-white sticky top-0 z-30 shadow-lg backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        
        {/* Logo SantoMate Personalizado */}
        <div className="flex items-center gap-3.5 cursor-pointer group">
          <img 
            src={logoImg} 
            alt="SantoMate Logo" 
            className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-200 rounded-lg shadow-sm" 
          />
          <div className="flex flex-col justify-center">
            <span className="font-black text-2xl tracking-wider text-stone-100 block leading-none">
              SANTO<span className="text-amber-400">MATE</span>
            </span>
            <span className="text-[11px] text-emerald-400/90 font-medium tracking-widest uppercase mt-1">
              Mates & Accesorios
            </span>
          </div>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Usuario / Sesión */}
          {user ? (
            <div className="flex items-center gap-2 bg-emerald-900/50 pl-3 pr-1.5 py-1 rounded-full border border-emerald-700/60">
              <span className="text-xs font-medium text-emerald-200 hidden sm:inline">
                Hola, <strong className="text-stone-100">{user.name || 'Usuario'}</strong>
              </span>
              <button
                onClick={onLogout}
                className="text-[11px] bg-red-950/60 hover:bg-red-900 text-red-200 px-2.5 py-1 rounded-full transition-colors font-semibold"
                title="Cerrar Sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="text-xs font-bold bg-emerald-900/80 hover:bg-emerald-800 text-stone-100 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-emerald-700/60 shadow-sm"
            >
              <span>👤</span> Ingresar
            </button>
          )}

          {/* Botón Carrito */}
          <button
            onClick={onOpenCart}
            className="relative bg-amber-500 hover:bg-amber-400 text-emerald-950 p-2.5 rounded-xl font-bold transition-all flex items-center justify-center shadow-md hover:scale-105"
            aria-label="Ver Carrito"
          >
            <span className="text-lg">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-950 text-amber-300 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-400 shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};