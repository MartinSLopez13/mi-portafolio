import React from 'react';
import logoImg from '../assets/logo.png'; 

export const Header = ({ cartCount, onOpenCart, user, onOpenLogin, onLogout }) => {
  return (
    <header className="bg-emerald-950/95 text-white sticky top-0 z-30 shadow-lg backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        
        {/* Logo SantoMate */}
        <div className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group min-w-0 shrink">
          <img 
            src={logoImg} 
            alt="SantoMate Logo" 
            className="h-10 sm:h-13 w-auto object-contain group-hover:scale-105 transition-transform duration-200 rounded-lg shadow-sm shrink-0" 
          />
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-black text-base sm:text-2xl tracking-wider text-stone-100 block leading-tight truncate">
              EL SANTO <span className="text-amber-400">MATE</span>
            </span>
            <span className="hidden md:block text-[9px] sm:text-[10px] text-emerald-300 font-semibold tracking-wider uppercase mt-0.5 leading-tight">
              DISTRIBUIDORA Y FABRICANTE DE ARTÍCULOS MATEROS
            </span>
          </div>
        </div>

        {/* Acciones del Header con estilo 3D táctil */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Botón: Personalizá tu producto */}
          <a
            href="/personalizador/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-b from-[#fcd34d] via-[#fbbf24] to-[#f59e0b] text-emerald-950 font-black text-xs sm:text-sm tracking-tight border-t border-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.25),0_3px_0_#d97706] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_1px_0_#d97706] transition-all cursor-pointer"
            title="Personalizá tu producto online"
          >
            {/* Ícono de chispas / estrella */}
            <svg 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-950 fill-current shrink-0" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z" />
            </svg>
            <span className="hidden sm:inline">Personalizá tu producto</span>
            <span className="sm:hidden text-[11px]">Diseñar</span>
          </a>

          {/* Botón: Usuario / Ingresar */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-emerald-900/60 pl-2.5 pr-1 py-1 rounded-full border border-emerald-700/60 shadow-inner">
              <span className="text-xs font-medium text-emerald-200 hidden md:inline max-w-[100px] truncate">
                {user.name || 'Usuario'}
              </span>
              <button
                onClick={onLogout}
                className="text-[10px] sm:text-[11px] bg-red-900/80 hover:bg-red-800 text-red-100 px-2 sm:px-2.5 py-1 rounded-full transition-colors font-semibold"
                title="Cerrar Sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="relative inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-b from-[#0f766e] via-[#0d645e] to-[#0a524d] text-white font-bold text-xs sm:text-sm tracking-tight border border-emerald-400/30 border-t-emerald-300/50 shadow-[0_4px_10px_rgba(0,0,0,0.3),0_3px_0_#063e3a] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_1px_0_#063e3a] transition-all cursor-pointer"
              title="Iniciar Sesión"
            >
              <svg 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100 fill-current shrink-0" 
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="hidden sm:inline">Ingresar</span>
            </button>
          )}

          {/* Botón: Carrito */}
          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-10 rounded-2xl bg-gradient-to-b from-[#fcd34d] via-[#fbbf24] to-[#f59e0b] text-emerald-950 font-black border-t border-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.25),0_3px_0_#d97706] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_4px_rgba(0,0,0,0.25),0_1px_0_#d97706] transition-all cursor-pointer shrink-0"
            aria-label="Ver Carrito"
            title="Ver Carrito"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-950 fill-none stroke-current stroke-[2.2]" 
              viewBox="0 0 24 24" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1" fill="currentColor" />
              <circle cx="20" cy="20" r="1" fill="currentColor" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {/* Contador de productos flotante */}
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-950 text-amber-300 font-black text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border border-amber-400 shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};