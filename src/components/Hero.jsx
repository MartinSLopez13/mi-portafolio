import React from 'react';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-emerald-900 via-emerald-950 to-stone-900 text-white py-16 px-4 overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-800/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
        <span className="inline-block bg-emerald-800/80 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-700 tracking-wider uppercase mb-2">
          Calidad Artesanal Selección Premium
        </span>

        <h1 className="text-3xl sm:text-5xl font-black text-stone-100 tracking-tight leading-tight">
          El ritual del buen mate, <br className="hidden sm:inline" />
          <span className="text-amber-400">hecho a tu medida.</span>
        </h1>

        <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
          Mates imperiales, camioneros de calabaza seleccionada, bombillas de alpaca y accesorios de marroquinería para revendedores y amantes del mate.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-6 text-xs text-emerald-200/90 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">✓</span> Calidad de Exportación
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">✓</span> Grabados Personalizados
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">✓</span> Atención Mayorista Directa
          </div>
        </div>
      </div>
    </section>
  );
};