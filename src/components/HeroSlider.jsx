import React, { useState, useEffect } from 'react';
import { getBanners } from '../api/client';

export const HeroSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fallbackBanners = [
    {
      id: 'fallback-1',
      badge: 'NUEVA COLECCIÓN',
      title: 'Mates Imperiales y Artesanales',
      subtitle: 'La mejor selección de alpaca, calabaza y algarrobo con envíos a todo el país.',
      image: '/hero.png',
      ctaText: 'Ver Catálogo'
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

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const current = activeBanners[currentIndex] || activeBanners[0];

  return (
    <section className="relative w-full bg-stone-900 text-white overflow-hidden min-h-[380px] sm:min-h-[460px] flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          src={current?.image || '/hero.png'}
          alt={current?.title || 'SantoMate'}
          className="w-full h-full object-cover opacity-35 transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex flex-col items-start gap-4">
        {current?.badge && (
          <span className="bg-amber-500 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
            {current.badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-black max-w-2xl leading-tight">
          {current?.title}
        </h1>
        <p className="text-sm sm:text-base text-stone-300 max-w-xl">
          {current?.subtitle}
        </p>
        <a
          href="#catalogo"
          className="mt-2 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
        >
          {current?.ctaText || 'Ver Catálogo'} →
        </a>
      </div>
    </section>
  );
};