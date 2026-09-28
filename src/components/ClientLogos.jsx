import React from 'react';

export const ClientLogos = () => {
  const clients = [
    { name: 'Fernet 777', logo: '/banners/LOGO 777.png' },
    { name: 'Banco Provincia', logo: '/banners/LOGO BANCO PROVINCIA.png' },
    { name: 'Betwarrior', logo: '/banners/LOGO BETWARRIOR.png' },
    { name: 'Docto Red', logo: '/banners/LOGO DOCTO RED.png' },
    { name: 'Hendel', logo: '/banners/LOGO HENDEL.png' },
    { name: 'Lisofast', logo: '/banners/LOGO LISOFAST.png' },
    { name: 'Moura', logo: '/banners/LOGO MOURA.png' },
    { name: 'Remax', logo: '/banners/LOGO REMAX.png' },
    { name: 'Universidad Kennedy', logo: '/banners/LOGO UNIVERSIDAD KENNEDY.png' },
  ];

  const displayLogos = [...clients, ...clients];

  return (
    <section className="relative py-8 sm:py-12 bg-emerald-50/70 border-y border-emerald-200/80 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-4 sm:mb-6 text-center">
        <h2 className="text-lg sm:text-2xl font-black text-emerald-950 tracking-tight uppercase">
          CLIENTES QUE CONFÍAN EN NOSOTROS
        </h2>
        <p className="text-xs sm:text-sm text-emerald-800/80 mt-1 font-medium max-w-lg mx-auto px-2">
          Empresas e instituciones que eligen nuestros productos para eventos y regalos corporativos
        </p>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-emerald-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-emerald-50 to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-3 sm:gap-6 py-2 w-max select-none">
          {displayLogos.map((client, idx) => (
            <div
              key={`${client.name}-${idx}`}
              className="flex items-center justify-center bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl border border-emerald-100 shadow-xs shrink-0"
            >
              <img
                src={client.logo}
                alt={client.name}
                className="h-7 sm:h-9 w-auto max-w-[110px] sm:max-w-[140px] object-contain pointer-events-none"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};