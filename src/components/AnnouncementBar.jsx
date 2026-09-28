import React from 'react';

export const AnnouncementBar = () => {
  return (
    <div className="w-full bg-emerald-950 text-emerald-100 text-xs py-2 px-3 sm:px-8 border-b border-emerald-900/60 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3 text-center md:text-left">
        
        {/* Izquierda: Dirección con enlace directo a Google Maps */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=Mendoza+95,+Marcos+Paz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-emerald-200 hover:text-amber-300 transition-colors group cursor-pointer"
          title="Ver ubicación en Google Maps"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-normal tracking-wide group-hover:underline text-[11px] sm:text-xs">
            Mendoza 95, Marcos Paz
          </span>
        </a>

        {/* Centro: Aviso de Compra Mínima e IVA */}
        <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 px-3 py-0.5 rounded-full shadow-xs">
          <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider">
            Compra mínima: $100.000
          </span>
          <span className="text-[10px] sm:text-[11px] text-amber-200/90 font-medium">
            (Precios no incluyen IVA)
          </span>
        </div>

        {/* Derecha: Horarios + WhatsApp */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
          {/* Horario de atención */}
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-200 text-[11px] sm:text-xs">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 text-emerald-400 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-normal">Lun a Vie 8:00 a 13:00 y 14:00 a 17:00 hs</span>
          </div>

          {/* WhatsApp directo */}
          <a
            href="https://wa.me/5491124060155"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white hover:text-amber-300 transition-colors font-bold text-[11px] sm:text-xs"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 text-emerald-400 shrink-0"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>011 15-2406-0155</span>
          </a>
        </div>

      </div>
    </div>
  );
};