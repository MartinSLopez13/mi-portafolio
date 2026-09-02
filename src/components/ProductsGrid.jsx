import React, { useState } from 'react';

export const ProductsGrid = ({ products, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para el producto seleccionado en el Modal de Detalle
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Estado para almacenar el color seleccionado de cada producto en la tarjeta { [productId]: "Color" }
  const [selectedCardColors, setSelectedCardColors] = useState({});
  // Estado para el color seleccionado dentro del Modal
  const [modalSelectedColor, setModalSelectedColor] = useState(null);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'mates', name: 'Mates' },
    { id: 'termos', name: 'Termos' },
    { id: 'bombillas', name: 'Bombillas' },
    { id: 'set-materos', name: 'Sets Azucar/Yerba' },
    { id: 'termicos', name: 'Térmicos' },
    { id: 'combos', name: 'Combos' },
    { id: 'vasos', name: 'Vasos' },
    { id: 'canasta', name: 'Canasta/Bolsos' },
    { id: 'pavas', name: 'Pavas' },
    { id: 'varios', name: 'Varios' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || 
      product.category === selectedCategory ||
      // Fallback para productos con nombres de categorías en mayúscula
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSelectCardColor = (productId, color) => {
    setSelectedCardColors((prev) => ({ ...prev, [productId]: color }));
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    
    // Determinar el color inicial (el elegido en la tarjeta o el primero del array)
    const defaultColor = selectedCardColors[product.id] || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
    setModalSelectedColor(defaultColor);

    // Calcular la foto inicial proporcional según el color
    const imagesList = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || 'https://via.placeholder.com/300x300?text=SantoMate'];

    if (product.colors && defaultColor && imagesList.length > 0) {
      const colorIdx = product.colors.indexOf(defaultColor);
      const imagesPerColor = Math.floor(imagesList.length / product.colors.length);

      if (colorIdx !== -1 && imagesPerColor >= 1) {
        const targetImageIndex = colorIdx * imagesPerColor;
        if (imagesList[targetImageIndex]) {
          setActiveImageIndex(targetImageIndex);
          return;
        }
      }
    }

    setActiveImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setActiveImageIndex(0);
    setModalSelectedColor(null);
  };

  const handleAddFromCard = (product, color) => {
    onAddToCart({
      ...product,
      selectedColor: color
    });
  };

  const getCategoryLabel = (catId) => {
    const match = categories.find((c) => c.id === catId || c.name.toLowerCase() === catId?.toLowerCase());
    return match ? match.name : (catId || 'General');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Título de Sección y Controles de Filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-stone-800 tracking-tight">
            Nuestros Productos
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Explorá nuestro catálogo completo con precios actualizados
          </p>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          
          {/* Input de Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 text-xs pl-8 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-emerald-800 shadow-sm"
            />
            <span className="absolute left-2.5 top-2.5 text-stone-400 text-xs">🔍</span>
          </div>

          {/* Categorías */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-900 text-amber-300 shadow'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm my-8">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="font-bold text-stone-700 text-sm">No encontramos resultados</h3>
          <p className="text-xs text-stone-400 mt-1">Intentá buscar con otro término o seleccionando otra categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const imagesList = Array.isArray(product.images) && product.images.length > 0
              ? product.images
              : [product.image || 'https://via.placeholder.com/300x300?text=SantoMate'];

            const isOutOfStock = product.stock !== undefined && product.stock <= 0;
            const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
            const activeColor = selectedCardColors[product.id] || (hasColors ? product.colors[0] : null);

            // Calcular dinámicamente qué imagen mostrar en la tarjeta según el color seleccionado
            let currentCardImage = imagesList[0];

            if (hasColors && activeColor && imagesList.length > 0) {
              const colorIdx = product.colors.indexOf(activeColor);
              const imagesPerColor = Math.floor(imagesList.length / product.colors.length);

              if (colorIdx !== -1 && imagesPerColor >= 1) {
                const targetIdx = colorIdx * imagesPerColor;
                if (imagesList[targetIdx]) {
                  currentCardImage = imagesList[targetIdx];
                }
              }
            }

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Imagen del Producto */}
                <div 
                  className="relative aspect-square bg-stone-100 overflow-hidden cursor-pointer"
                  onClick={() => handleOpenModal(product)}
                >
                  <img
                    src={currentCardImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badge Categoría */}
                  <span className="absolute top-3 left-3 bg-stone-900/80 text-stone-100 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {getCategoryLabel(product.category)}
                  </span>

                  {/* Badge Múltiples Fotos */}
                  {imagesList.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                      📷 +{imagesList.length - 1}
                    </span>
                  )}

                  {/* Badge Destacado */}
                  {product.featured && (
                    <span className="absolute top-3 right-3 bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                      ★ Destacado
                    </span>
                  )}

                  {/* Overlay cuando está Sin Stock */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wider">
                        Sin Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Detalle del Producto */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="cursor-pointer" onClick={() => handleOpenModal(product)}>
                    <h3 className="font-bold text-stone-800 text-base group-hover:text-emerald-900 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Selector de Colores en Tarjeta */}
                  {hasColors && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                        Color: <span className="text-stone-800 font-extrabold">{activeColor}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleSelectCardColor(product.id, color)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                              activeColor === color
                                ? 'bg-emerald-900 text-amber-300 border-emerald-900 shadow-xs'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">Precio</span>
                      <span className="text-lg font-black text-emerald-950">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddFromCard(product, activeColor);
                      }}
                      disabled={isOutOfStock}
                      className={`font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5 active:scale-95 ${
                        isOutOfStock 
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                          : 'bg-emerald-900 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <span>🛒</span> {isOutOfStock ? 'Agotado' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALLE DE PRODUCTO */}
      {selectedProduct && (() => {
        const modalImages = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
          ? selectedProduct.images
          : [selectedProduct.image || 'https://via.placeholder.com/300x300?text=SantoMate'];

        const isOutOfStock = selectedProduct.stock !== undefined && selectedProduct.stock <= 0;
        const hasColors = Array.isArray(selectedProduct.colors) && selectedProduct.colors.length > 0;

        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-stone-100 my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón Cerrar */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-10 bg-stone-900/70 hover:bg-stone-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow"
              >
                ✕
              </button>

              {/* Scroll interno */}
              <div className="overflow-y-auto flex-1 scrollbar-none">
                
                {/* Imagen Principal */}
                <div className="relative bg-stone-100 flex items-center justify-center max-h-56 overflow-hidden p-2">
                  <img 
                    src={modalImages[activeImageIndex]} 
                    alt={selectedProduct.name}
                    className="max-h-52 w-auto object-contain mx-auto" 
                  />
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-red-600 text-white font-black text-sm px-4 py-2 rounded-xl shadow-lg uppercase tracking-wider">
                        Sin Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Galería de Miniaturas / Thumbnails */}
                {modalImages.length > 1 && (
                  <div className="flex gap-2 px-5 pt-3 overflow-x-auto scrollbar-none">
                    {modalImages.map((imgUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeImageIndex === index 
                            ? 'border-emerald-900 scale-105 shadow' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Información y Acción */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {getCategoryLabel(selectedProduct.category)}
                    </span>
                    <h3 className="text-lg font-black text-stone-800 mt-2">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {selectedProduct.description || "Sin descripción disponible para este producto."}
                    </p>
                  </div>

                  {/* Selector de Colores en Modal */}
                  {hasColors && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                        Selecciona un Color: <span className="text-stone-800 font-extrabold">{modalSelectedColor}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.colors.map((color, colorIdx) => (
                          <button
                            key={color}
                            onClick={() => {
                              setModalSelectedColor(color);

                              const totalImages = modalImages.length;
                              const totalColors = selectedProduct.colors.length;
                              const imagesPerColor = Math.floor(totalImages / totalColors);

                              if (imagesPerColor >= 1) {
                                const targetImageIndex = colorIdx * imagesPerColor;
                                if (modalImages[targetImageIndex]) {
                                  setActiveImageIndex(targetImageIndex);
                                }
                              }
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                              modalSelectedColor === color
                                ? 'bg-emerald-900 text-amber-300 border-emerald-900 shadow-sm scale-105'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">Precio Total</span>
                      <span className="text-xl font-black text-emerald-950">
                        {formatPrice(selectedProduct.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart({
                          ...selectedProduct,
                          selectedColor: modalSelectedColor
                        });
                        handleCloseModal();
                      }}
                      disabled={isOutOfStock}
                      className={`font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 ${
                        isOutOfStock
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                          : 'bg-emerald-900 hover:bg-emerald-800 text-white active:scale-95'
                      }`}
                    >
                      <span>🛒</span> {isOutOfStock ? 'Sin Stock' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};