import React from 'react';
import logoImg from '../assets/logo.png';

export const Footer = () => {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 text-stone-600 py-12 px-6 sm:px-12 font-sans text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Columna 1: Logo de El Santo Mate y Redes Sociales */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="El Santo Mate" 
              className="h-10 sm:h-12 w-auto object-contain rounded-lg shadow-xs" 
            />
            <span className="font-black text-lg text-emerald-950 tracking-tight uppercase">
              El Santo Mate
            </span>
          </div>

          {/* Botones de Redes Sociales circulares */}
          <div className="flex items-center gap-2.5 mt-1">
            {/* Facebook */}
            <a 
              href="https://www.facebook.com/elsantomatemp/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Seguinos en Facebook"
              className="w-9 h-9 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:text-emerald-900 hover:border-emerald-700 hover:bg-emerald-50 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
              </svg>
            </a>

            {/* Instagram */}
            <a 
              href="https://www.instagram.com/elsantomate/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Seguinos en Instagram"
              className="w-9 h-9 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:text-emerald-900 hover:border-emerald-700 hover:bg-emerald-50 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* TikTok */}
            <a 
              href="https://www.tiktok.com/@elsantomate" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Seguinos en TikTok"
              className="w-9 h-9 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:text-emerald-900 hover:border-emerald-700 hover:bg-emerald-50 transition-all shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.4-.04 2.64-.94 3.05-2.28.16-.54.21-1.1.2-1.66.02-4.92.01-9.84.01-14.76.02-.07.03-.13.06-.2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Columna 2: Ubicación física y Contacto */}
        <div className="space-y-1.5 leading-relaxed text-stone-600">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Mendoza+95,+Marcos+Paz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-900 transition-colors block font-medium"
          >
            Mendoza 95, Marcos Paz
          </a>
          <p className="text-stone-500">Provincia de Buenos Aires (CP: 1727)</p>
          <p className="text-stone-500">Argentina</p>
          
          <p className="pt-2">
            <span className="font-semibold text-stone-700">Tel:</span>{' '}
            <a href="tel:1124060155" className="hover:text-emerald-900 transition-colors">
              11 2406-0155
            </a>
          </p>

          <a 
            href="mailto:ventas@elsantomate.com" 
            className="inline-block text-emerald-950 font-bold underline underline-offset-4 hover:text-emerald-700 transition-colors pt-1"
          >
            ventas@elsantomate.com
          </a>
        </div>

        {/* Columna 3: Navegación interna */}
        <div className="flex flex-col space-y-2.5 font-bold uppercase tracking-wider text-stone-700 text-xs">
          <a href="#" className="hover:text-emerald-900 transition-colors w-fit">
            INICIO
          </a>
          <a 
            href="https://wa.me/5491124060155" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-emerald-900 transition-colors w-fit"
          >
            CONTACTO
          </a>
          <a href="#catalogo" className="hover:text-emerald-900 transition-colors w-fit">
            TIENDA ONLINE
          </a>
        </div>

        {/* Columna 4: Derechos reservados y Data Fiscal */}
        <div className="flex flex-col items-start md:items-end gap-3 text-stone-500 text-xs">
          <p className="font-medium text-stone-600">
            © {new Date().getFullYear()} El Santo Mate.
          </p>
          
          {/* Badge Data Fiscal simulado / QR */}
          <a 
            href="http://qr.afip.gob.ar" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="border border-sky-400 bg-white p-1 rounded-sm shadow-2xs hover:opacity-90 transition-opacity flex flex-col items-center w-[54px]"
            title="Formulario 960/D - Data Fiscal"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
              alt="Data Fiscal QR" 
              className="w-10 h-10 object-contain"
            />
            <span className="bg-sky-600 text-white text-[7px] font-black tracking-tighter uppercase px-1 w-full text-center mt-0.5 leading-tight rounded-xs">
              DATA FISCAL
            </span>
          </a>
        </div>

      </div>
    </footer>
  );
};