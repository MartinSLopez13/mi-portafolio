import React from 'react';

export const ShippingBenefits = () => {
  const nationalOptions = [
    {
      name: 'Vía Cargo',
      logo: '/banners/via.png',
      // Corregido: sin scale gigante para que se lea completo sin cortes
      imgClass: 'max-h-8 sm:max-h-9 w-auto max-w-[80%] sm:max-w-[85%] object-contain'
    },
    {
      name: 'Andreani',
      logo: '/banners/andreani.png',
      imgClass: 'max-h-6 sm:max-h-7 w-auto max-w-[130px] sm:max-w-[150px] object-contain'
    },
    {
      name: 'Correo Argentino',
      logo: '/banners/correo.png',
      imgClass: 'max-h-7 sm:max-h-8 w-auto max-w-[130px] sm:max-w-[150px] object-contain'
    },
    {
      name: 'Mensajería FLEX',
      isFlex: true
    }
  ];

  return (
    <section className="bg-white border-b border-stone-200 py-4 sm:py-6 px-3 sm:px-8 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Grilla principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          
          {/* Bloque Izquierdo: Nacionales */}
          <div className="lg:col-span-7 xl:col-span-8 bg-stone-50/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/80 flex flex-col justify-between">
            <div className="mb-2.5">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-stone-900 tracking-tight uppercase">
                ENVÍOS A TODO EL PAÍS
              </h2>
            </div>

            {/* Grilla 2x2 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {nationalOptions.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-center h-16 sm:h-20 px-3 py-2 rounded-xl sm:rounded-2xl border border-stone-200/90 bg-white hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 overflow-hidden relative"
                >
                  {item.isFlex ? (
                    <div className="flex flex-col items-center justify-center text-emerald-950 bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-1 rounded-xl w-full h-full max-w-[190px] shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="w-4 h-4 text-emerald-700 shrink-0"
                        >
                          <rect width="13" height="10" x="1" y="5" rx="1.5" />
                          <path d="M14 8h4l3 3.5v3.5h-7V8z" />
                          <circle cx="5.5" cy="17.5" r="2.5" />
                          <circle cx="17.5" cy="17.5" r="2.5" />
                          <path d="M1 9h2" />
                          <path d="M1 12h3" />
                        </svg>
                        <span className="font-black text-xs tracking-wider uppercase whitespace-nowrap">
                          ENVÍO FLEX
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-900 mt-0.5 leading-tight">
                        Entregas en 24/48 hs
                      </span>
                      <span className="text-[8px] font-extrabold text-emerald-800 tracking-wider uppercase leading-none mt-0.5">
                        CABA - AMBA
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <img
                        src={item.logo}
                        alt={item.name}
                        className={item.imgClass}
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bloque Derecho: Envíos Internacionales */}
          <a
            href="https://wa.me/5491124060155?text=Hola!%20Quería%20consultar%20por%20un%20envío%20internacional"
            target="_blank"
            rel="noopener noreferrer"
            className="lg:col-span-5 xl:col-span-4 bg-[#E8F8F0] hover:bg-[#dcf4e8] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-200/70 transition-all duration-300 flex flex-col items-center justify-between text-center group cursor-pointer shadow-xs hover:shadow-md relative overflow-hidden"
          >
            {/* Ícono de Mundo + Órbita + Avión */}
            <div className="pt-0.5">
              <svg 
                className="w-24 h-24 sm:w-28 sm:h-28 text-emerald-900 group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs" 
                viewBox="0 0 140 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="64" cy="62" r="32" stroke="currentColor" strokeWidth="3" />
                <ellipse cx="64" cy="62" rx="14" ry="32" stroke="currentColor" strokeWidth="2.4" />
                <line x1="32" y1="62" x2="96" y2="62" stroke="currentColor" strokeWidth="2.4" />
                <line x1="38" y1="46" x2="90" y2="46" stroke="currentColor" strokeWidth="2" />
                <line x1="38" y1="78" x2="90" y2="78" stroke="currentColor" strokeWidth="2" />

                <path 
                  d="M20 74 C 28 92, 85 94, 108 56 C 114 46, 116 38, 112 34" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                <g transform="translate(100, 36) rotate(12)">
                  <path 
                    d="M-4 12 L14 0 L10 14 L22 17 L6 23 L2 29 L0 23 L-8 21 Z" 
                    fill="#E8F8F0" 
                    stroke="currentColor" 
                    strokeWidth="2.4" 
                    strokeLinejoin="round" 
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>

            {/* Título y subtítulo */}
            <div className="my-auto py-1">
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-stone-900 tracking-tight uppercase leading-tight">
                ENVÍOS<br />INTERNACIONALES
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-stone-600 mt-1">
                Sí, llegamos a todo el mundo.
              </p>
            </div>

            {/* Estela de puntos curva con avioncito */}
            <div className="w-full flex items-center justify-center pt-1 text-emerald-800">
              <svg className="w-44 h-7" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 24 C 55 30, 95 10, 136 15" 
                  stroke="currentColor" 
                  strokeWidth="1.8" 
                  strokeDasharray="3.5 3.5" 
                  strokeLinecap="round"
                />
                <g transform="translate(138, 14) rotate(-15)">
                  <path 
                    d="M0 0 L14 4 L1 10 L4 5 Z" 
                    fill="currentColor" 
                    stroke="currentColor" 
                    strokeWidth="0.8" 
                    strokeLinejoin="round" 
                  />
                </g>
              </svg>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
};