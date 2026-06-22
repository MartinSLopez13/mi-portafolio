import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductsGrid from '../components/ProductsGrid';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import MisPedidos from './components/MisPedidos';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. REINCORPORAMOS EL ESTADO GLOBAL DE CATEGORÍA PARA EL MENÚ DE ÍCONOS
  const [categoryQuery, setCategoryQuery] = useState('Todas');

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* 2. PASAMOS AMBOS MODIFICADORES AL HEADER (Búsqueda y Categorías con íconos) */}
      <Header 
        onSearch={(query) => setSearchQuery(query)} 
        onCategoryChange={(categoria) => setCategoryQuery(categoria)} 
      />
      
      {/* 3. El Hero/Slider se oculta si buscan algo O si filtran una categoría que no sea 'Todas' */}
      {!searchQuery && categoryQuery === 'Todas' && <Hero searchQuery={searchQuery} />}
      
      <main className={`relative ${searchQuery || categoryQuery !== 'Todas' ? 'pt-10' : ''}`}>
        
        {/* Botón de retroceso si hay algún filtro activo */}
        {(searchQuery || categoryQuery !== 'Todas') && (
          <div className="max-w-7xl mx-auto px-4 mb-6">
            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryQuery('Todas'); // Resetea ambos filtros a la vez
              }}
              className="text-cyan-600 hover:underline font-bold text-sm"
            >
              ← Ver todos los productos
            </button>
          </div>
        )}
        
        {/* 4. LE PASAMOS LAS DOS PROPS COMPLEMENTARIAS A TU GRILLA */}
        <div id="products-grid" style={{ scrollMarginTop: '100px' }}>
          <ProductsGrid 
            searchQuery={searchQuery} 
            categoryQuery={categoryQuery}
            setCategoryQuery={setCategoryQuery} // Pasamos el set por si cambian la categoría desde el select interno
          />
        </div>

        <div className="max-w-2xl mx-auto p-4 mt-16">
          <MisPedidos />
        </div> 
      </main>
      
      <Footer />
      <CartSidebar /> 
    </div>
  );
};

export default HomePage;