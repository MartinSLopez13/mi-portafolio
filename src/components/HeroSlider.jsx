import React, { useState, useEffect } from 'react';
import { getBanners } from '../api/client';

export const HeroSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ⏱️ TIEMPO EN MILISEGUNDOS (5000 = 5 segundos por banner)
  const SLIDE_DURATION = 5000;

  const fallbackBanners = [
    {
      id: 'fallback-1',
      badge: 'OFERTA DESTACADA',
      title: 'EL SANTO MATE',
      subtitle: 'Mates y termos de diseño artesanal con envíos a todo el país.',
      image: '/hero.png',
      mobileImage: '/hero.png', // Podés definir una versión vertical acá
      ctaText: 'Ver Productos'
    }
  ];

  useEffect(() => {
    const fetchSliderBanners = async () => {
      try {
        const data = await getBanners();
        if (data && data.length > 0) {
          setBanners(data);
        } else {
          setBanners(fallbackBanners);
        }
      } catch (err) {
        console.warn("No se pudieron cargar banners remotos, usando banner por defecto:", err);
        setBanners(fallbackBanners);
      }
    };

    fetchSliderBanners();
  }, []);

  const activeBanners = banners.length > 0 ? banners : fallbackBanners;

  // Temporizador para pasar banners automáticamente
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  const current = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const isVideoResource = (item) => {
    if (!item?.image) return false;
    if (item.type === 'video') return true;
    const cleanUrl = item.image.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov');
  };

  const isCurrentVideo = isVideoResource(current);

  // Detección de imagen para móvil si viene del backend
  const desktopImg = current?.image || '/hero.png';
  const mobileImg = current?.mobileImage || current?.imageMobile || desktopImg;

  return (
    <section 
      className="relative w-full overflow-hidden min-h-[360px] sm:min-h-[460px] md:min-h-[520px] flex items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fondo multimedia responsivo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isCurrentVideo ? (
          <video
            key={current?.image}
            src={current?.image}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        ) : (
          <picture>
            {/* Si existe imagen mobile específica, el celular muestra esta */}
            <source media="(max-width: 640px)" srcSet={mobileImg} />
            {/* Computadoras y tablets */}
            <img
              key={desktopImg}
              src={desktopImg}
              alt={current?.title || 'SantoMate'}
              className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out"
            />
          </picture>
        )}

        {/* Degradado sutil para asegurar legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent sm:bg-gradient-to-r sm:from-stone-950/80 sm:via-stone-950/35 sm:to-transparent pointer-events-none" />
      </div>

      {/* Contenido flotante */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 md:px-12 py-10 sm:py-12 flex justify-start">
        <div className="flex flex-col items-start gap-2.5 sm:gap-3.5 max-w-md sm:max-w-lg w-full">
          
          {current?.badge && (
            <span className="bg-amber-500 text-stone-950 text-[10px] sm:text-[11px] font-black px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md">
              {current.badge}
            </span>
          )}

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] tracking-tight break-words w-full">
            {current?.title}
          </h1>

          {current?.subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-stone-100 font-medium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-sm sm:max-w-none">
              {current?.subtitle}
            </p>
          )}

          <a
            href="#catalogo"
            className="mt-2 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 border border-emerald-500/30"
          >
            <span>{current?.ctaText || 'Ver Productos'}</span>
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Controles: Flechas y Puntos (solo si hay más de 1 banner) */}
      {activeBanners.length > 1 && (
        <>
          {/* Flecha Anterior */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-950/40 hover:bg-stone-950/80 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-70 hover:opacity-100 active:scale-90"
            title="Banner anterior"
          >
            <span className="text-base sm:text-lg font-black leading-none">‹</span>
          </button>

          {/* Flecha Siguiente */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-950/40 hover:bg-stone-950/80 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-70 hover:opacity-100 active:scale-90"
            title="Siguiente banner"
          >
            <span className="text-base sm:text-lg font-black leading-none">›</span>
          </button>

          {/* Puntos Indicadores */}
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-1.5 pointer-events-auto">
            {activeBanners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === dotIdx
                    ? 'w-6 h-1.5 bg-amber-400 shadow-sm'
                    : 'w-2 h-1.5 bg-white/50 hover:bg-white'
                }`}
                title={`Ir al banner ${dotIdx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};