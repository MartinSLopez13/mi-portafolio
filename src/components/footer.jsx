import React from 'react';

export const Footer = () => {
  const whatsappNumber = "5491122334455";
  const message = encodeURIComponent("Hola! Quisiera realizar un pedido / consulta en SantoMate");

  return (
    <footer className="bg-emerald-950 text-stone-300 py-12 border-t border-emerald-900/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna 1: Marca */}
        <div>
          <h3 className="text-xl font-black text-white tracking-wider mb-2">SANTOMATE</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Especialistas en mates imperiales, bombillas, termos y accesorios de calidad premium. Ventas por menor y mayor.
          </p>
        </div>

        {/* Columna 2: Navegación Rápida */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">Categorías</h4>
          <ul className="text-xs space-y-2 text-stone-400">
            <li><a href="#catalogo" className="hover:text-amber-300 transition-colors">Mates Imperiales y Camioneros</a></li>
            <li><a href="#catalogo" className="hover:text-amber-300 transition-colors">Bombillas y Alpacas</a></li>
            <li><a href="#catalogo" className="hover:text-amber-300 transition-colors">Termos y Accesorios</a></li>
          </ul>
        </div>

        {/* Columna 3: Contacto Directo */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">Atención al Cliente</h4>
          <p className="text-xs text-stone-400 mb-3">¿Tenés dudas con tu compra o necesitás presupuesto mayorista?</p>
          
          <a
            href={`https://wa.me/${whatsappNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <span>💬</span>
            <span>Hablar por WhatsApp</span>
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 mt-8 border-t border-emerald-900/50 text-center text-[11px] text-stone-500">
        © {new Date().getFullYear()} SantoMate. Todos los derechos reservados.
      </div>
    </footer>
  );
};