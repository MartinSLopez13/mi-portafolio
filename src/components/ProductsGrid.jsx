import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/Config';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from './ProductCard';

// 1. RECIBIMOS LAS PROPS QUE ENVIAMOS DESDE HOMEPAGE
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

  // FILTRADO COMBINADO CONECTADO AL ESTADO GLOBAL DEL HEADER
  const filteredProducts = products.filter(product => {
    const nombreProducto = String(product.name || '').toLowerCase();
    const codigoProducto = String(product.codigo || '').toLowerCase();
    const busquedaUsuario = String(searchQuery || '').toLowerCase();
    
    const categoriaProducto = String(product.category || 'General').trim().toLowerCase();
    
    // LEEMOS 'categoryQuery' QUE VIENE DE LAS PROPS DE LA HOME
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
    // 🎨 Ajustamos pt-12 (padding top) para empujar el contenido hacia abajo y alejarlo del slider
    <div className="max-w-7xl mx-auto px-4 pt-12 space-y-6">
      
      {/* 🖌️ Línea divisoria decorativa y espaciado intermedio */}
      <div className="w-full border-t border-gray-100 pt-6 px-2 flex items-center justify-between">
        {/* Recuento informativo */}
        <p className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
          Mostrando {filteredProducts.length} resultados de {products.length} productos disponibles
        </p>
      </div>

      {/* Grilla de productos ordenada de la A a la Z */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {filteredProducts.length > 0 ? (
          filteredProducts
            .sort((a, b) => (a.name || '').localeCompare(b.name || '')) 
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