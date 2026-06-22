import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Percent, Truck, ShieldCheck, BadgePercent } from 'lucide-react';
import { db } from '../Firebase/Config'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard';

// IMPORTAMOS SWIPER COMPONENTES Y ESTILOS
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// ESTILOS DE SWIPER
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${className}`}>
    {children}
  </button>
);

const Hero = ({ searchQuery }) => {
  const [ofertas, setOfertas] = useState([]);

  // Escuchamos las ofertas destacadas en tiempo real de Firestore
  useEffect(() => {
    const q = query(collection(db, "productos"), where("destacado", "==", true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productosDestacados = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOfertas(productosDestacados);
    }, (error) => {
      console.error("Error al escuchar ofertas en tiempo real:", error);
    });

    return () => unsubscribe();
  }, []); 

  if (searchQuery && searchQuery.length > 0) {
    return null;
  }

  const scrollToProducts = () => {
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/541112345678', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative bg-gray-900 rounded-b-[3rem] shadow-xl overflow-hidden min-h-[65vh] flex items-center">
      {/* Fondo base con gradiente y textura de malla sutil */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-950" />
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Si no hay ofertas cargadas, renderiza el banner por defecto fijo */}
      {ofertas.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-16 md:py-20">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold text-xs border border-cyan-500/20 uppercase tracking-widest">
              Venta Mayorista y Minorista
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
              Papelera <span className="text-cyan-500">Bayres</span>
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-lg leading-relaxed font-medium">
              Abasteciendo a empresas, comercios y librerías con el stock más completo del mercado.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button onClick={scrollToProducts} className="bg-cyan-500 text-white hover:bg-cyan-600 shadow-xl uppercase tracking-wider text-xs px-8 py-4 group">
                Ver Catálogo <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        
        // --- VISTA SLIDER ACTIVA ---
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          className="w-full relative z-10 hero-swiper animate-in fade-in duration-700"
          style={{
            '--swiper-navigation-color': '#06b6d4',
            '--swiper-pagination-color': '#06b6d4',
          }}
        >
          {/* 🔥 SLIDE 1 REDISEÑADO: Ahora bien relleno, robusto y estético */}
          <SwiperSlide className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              
              {/* Bloque Izquierdo: Textos */}
              <div className="lg:col-span-3 space-y-6 text-center lg:text-left">
                <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs border border-cyan-500/20 uppercase tracking-widest">
                  Distribuidora Líder
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                  Papelera <span className="text-cyan-500">Bayres</span>
                  <br />
                  <span className="text-xl md:text-2xl text-cyan-200/70 font-medium italic block mt-2">
                    Tu aliado estratégico en insumos
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-gray-300 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                  Abastecemos a empresas, fábricas y librerías de todo el país con la mejor logística, stock permanente y una atención corporativa personalizada.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                  <Button onClick={scrollToProducts} className="bg-cyan-500 text-white hover:bg-cyan-600 uppercase tracking-wider text-xs px-8 py-4 shadow-lg shadow-cyan-500/20">
                    Ver Catálogo Completo
                  </Button>
                  <Button onClick={handleWhatsAppClick} className="bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 backdrop-blur-sm uppercase tracking-wider text-xs px-8 py-4">
                    Llamar Ventas
                  </Button>
                </div>
              </div>

              {/* Bloque Derecho (RELLENO): Módulo estético de pilares comerciales */}
              <div className="lg:col-span-2 w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl space-y-4">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-3">Servicio Distribución Baires</h3>
                
                <div className="flex gap-4 items-start p-2 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20"><Truck size={18}/></div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-wide">Despacho en 24 Horas</h4>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Coordinamos la entrega de tus pedidos de forma rápida y segura.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-2 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20"><BadgePercent size={18}/></div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-wide">Precios de Fábrica</h4>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Accedé a tarifas netas mayoristas y presupuestos por volumen cerrado.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-2 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20"><ShieldCheck size={18}/></div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-wide">Garantía de Stock</h4>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Trabajamos directo con las principales marcas.</p>
                  </div>
                </div>
              </div>

            </div>
          </SwiperSlide>

          {/* SLIDES DE OFERTAS (Inalterados, se ven geniales con la tarjeta) */}
          {ofertas.map((producto, index) => (
            <SwiperSlide key={producto.id} className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                
                <div className="lg:col-span-3 space-y-6 text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 font-black text-xs border border-red-500/20 uppercase tracking-widest animate-pulse">
                    <Percent className="w-3.5 h-3.5" /> Oferta Semanal #{index + 1}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                    Artículo Destacado <br /> 
                    en <span className="text-cyan-400">Precio Especial</span>
                  </h2>
                  <p className="text-xs md:text-sm text-gray-300 max-w-md font-medium leading-relaxed mx-auto lg:mx-0">
                    Oportunidad por tiempo limitado o hasta agotar remanente en depósito mayorista. Iniciá sesión para congelar la tarifa.
                  </p>
                  <div className="pt-2">
                    <Button onClick={scrollToProducts} className="bg-cyan-500 text-white hover:bg-cyan-600 uppercase tracking-wider text-xs px-8 py-4 mx-auto lg:mx-0">
                      Ir al Catálogo
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-2 flex justify-center w-full max-w-sm mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative w-full bg-white rounded-[2.2rem] shadow-2xl overflow-hidden p-2">
                     <ProductCard product={producto} />
                  </div>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default Hero;