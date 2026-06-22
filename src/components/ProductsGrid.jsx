import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/Config';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Filter, ChevronDown } from 'lucide-react'; 
import ProductCard from './ProductCard';

// 1. REINCORPORAMOS LAS PROPS QUE ENVIAMOS DESDE HOMEPAGE
const ProductsGrid = ({ searchQuery, categoryQuery, setCategoryQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]); 

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("Conectando a Firebase...");
      try {
        const productsCollection = collection(db, "productos");
        const snapshot = await getDocs(productsCollection);
        console.log("Snapshot recibido:", snapshot.docs.length, "productos");

        const productList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(productList);

        const categoriasUnicas = [
          'Todas',
          ...new Set(productList.map(p => p.category || 'General'))
        ];
        setCategorias(categoriasUnicas);
        
        setLoading(false);
      } catch (error) {
        console.error("Error detallado de Firebase:", error);
        alert("Error de conexión: " + error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FILTRADO COMBINADO CONECTADO AL ESTADO GLOBAL
  const filteredProducts = products.filter(product => {
    const nombreProducto = String(product.name || '').toLowerCase();
    const codigoProducto = String(product.codigo || '').toLowerCase();
    const busquedaUsuario = String(searchQuery || '').toLowerCase();
    
    const categoriaProducto = String(product.category || 'General').trim().toLowerCase();
    
    // 2. AHORA LEEMOS 'categoryQuery' QUE VIENE DE LAS PROPS DE LA HOME
    const categoriaFiltro = String(categoryQuery || 'Todas').trim().toLowerCase();

    const coincideBusqueda = 
      nombreProducto.includes(busquedaUsuario) || 
      codigoProducto.includes(busquedaUsuario);

    const coincideCategoria = 
      categoriaFiltro === 'todas' || 
      categoriaProducto === categoriaFiltro;

    return coincideBusqueda && coincideCategoria;
  });

  if (loading) return <div className="text-center p-10 font-bold">Cargando productos de Papelera Baires...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      
      {/* BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[2rem] shadow-md border border-gray-100">
        
        {/* Input Buscador Sincronizado */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o código de artículo..." 
            value={searchQuery}
            disabled // Queda de lectura ya que la búsqueda activa real se escribe desde el Header superior
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none text-gray-400 cursor-not-allowed animate-in"
          />
        </div>

        {/* 🛠️ SELECT CONECTADO: Muta el estado global de la Home (setCategoryQuery) */}
        <div className="relative w-full md:w-72">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 w-4 h-4 z-10 pointer-events-none" />
          <select
            value={categoryQuery} // 3. USA EL VALOR GLOBAL
            onChange={(e) => setCategoryQuery(e.target.value)} // 4. ACTUALIZA EL ESTADO GLOBAL
            className="w-full pl-11 pr-10 py-4 bg-cyan-50 text-cyan-800 border-none rounded-2xl text-xs font-black uppercase tracking-wider outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-500 transition-all shadow-sm"
          >
            {categorias.map((cat, index) => (
              <option key={index} value={cat} className="bg-white text-gray-700 font-bold uppercase text-xs">
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-600 w-4 h-4 pointer-events-none" />
        </div>

      </div>

      {/* Recuento informativo */}
      <div className="px-2">
        <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
          Mostrando {filteredProducts.length} resultados de {products.length} productos disponibles
        </p>
      </div>

      {/* Grilla de productos ordenada de la A a la Z */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts
            .sort((a, b) => a.name.localeCompare(b.name)) 
            .map(product => (
              <ProductCard key={product.id} product={product} />
            ))
        ) : (
          <p className="col-span-full text-center py-20 text-gray-400 font-black uppercase text-xs tracking-widest bg-gray-50 rounded-[3rem] border border-dashed">
            No se encontraron productos en esta categoría.
          </p>
        )}
      </div>

    </div>
  );
};

export default ProductsGrid;