import React, { useState } from 'react';

export const ProductsGrid = ({ products, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Control de índice de imagen activa en cada tarjeta
  const [cardImageIndices, setCardImageIndices] = useState({});

  // Control del modal de detalle de producto
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Control de colores seleccionados en tarjetas y en modal
  const [selectedCardColors, setSelectedCardColors] = useState({});
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

  const filteredProducts = (products || []).filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || 
      product.category === selectedCategory ||
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
    }).format(amount || 0);
  };

  const handlePrevCardImage = (e, productId, totalImages) => {
    e.stopPropagation();
    setCardImageIndices((prev) => {
      const current = prev[productId] || 0;
      return { ...prev, [productId]: (current - 1 + totalImages) % totalImages };
    });
  };

  const handleNextCardImage = (e, productId, totalImages) => {
    e.stopPropagation();
    setCardImageIndices((prev) => {
      const current = prev[productId] || 0;
      return { ...prev, [productId]: (current + 1) % totalImages };
    });
  };

  const handleSelectCardColor = (productId, color) => {
    setSelectedCardColors((prev) => ({ ...prev, [productId]: color }));
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setModalQuantity(1);
    
    const defaultColor = selectedCardColors[product.id] || (product.colors && product.colors.length > 0 ? product.colors[0] : null);
    setModalSelectedColor(defaultColor);

    const cardCurrentIdx = cardImageIndices[product.id] || 0;
    setActiveImageIndex(cardCurrentIdx);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setActiveImageIndex(0);
    setModalSelectedColor(null);
    setModalQuantity(1);
  };

  const handleAddFromCard = (product, color) => {
    onAddToCart({
      ...product,
      quantity: 1,
      selectedColor: color
    });
  };

  const getCategoryLabel = (catId) => {
    const match = categories.find((c) => c.id === catId || c.name.toLowerCase() === catId?.toLowerCase());
    return match ? match.name : (catId || 'General');
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-hidden">
      
      {/* BARRA INFORMATIVA DE FACTURACIÓN */}
      <div className="w-full max-w-3xl mx-auto mb-8 px-2 sm:px-4">
        <div className="bg-emerald-950/5 border border-emerald-900/15 rounded-2xl py-2.5 sm:py-3 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🧾</span>
            <span className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-wide">
              Realizamos Factura A y B
            </span>
          </div>
          <span className="hidden sm:inline text-stone-300 font-bold">•</span>
          <span className="text-[11px] sm:text-xs font-semibold text-amber-700 bg-amber-100/60 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            Los precios de la página no incluyen IVA
          </span>
        </div>
      </div>

      {/* ENCABEZADO */}
      <div className="w-full max-w-2xl mx-auto mb-10 sm:mb-12 flex flex-col items-center text-center">
        <div className="relative inline-block mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
            NUESTROS <span className="text-amber-500">PRODUCTOS</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="w-2 h-1 rounded-full bg-emerald-700"></span>
            <span className="w-14 h-1 rounded-full bg-emerald-900"></span>
            <span className="w-2 h-1 rounded-full bg-amber-400"></span>
          </div>
        </div>

        {/* Buscador y Dropdown */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white p-2 rounded-2xl sm:rounded-full border border-stone-200 shadow-sm hover:border-emerald-800/40 hover:shadow-md transition-all duration-200">
          <div className="relative w-full flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs sm:text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar mate, termo, bombilla..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-transparent text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none font-medium"
            />
            {Boolean(searchQuery) && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center text-[10px] font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hidden sm:block h-7 w-[1px] bg-stone-200"></div>

          <div className="relative w-full sm:w-56 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-stone-50 sm:bg-transparent hover:bg-stone-100/70 border border-stone-200 sm:border-none rounded-xl sm:rounded-full pl-4 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-stone-800 focus:outline-none cursor-pointer transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-stone-800 font-medium py-1">
                  {cat.name === 'Todos' ? 'Todas las categorías' : cat.name}
                </option>
              ))}
            </select>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-900 flex items-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] font-semibold text-stone-400">
          Mostrando {filteredProducts.length} producto{filteredProducts.length === 1 ? '' : 's'}
          {selectedCategory !== 'all' ? (
            <span className="text-emerald-800 font-bold ml-1">
              en {categories.find((c) => c.id === selectedCategory)?.name}
            </span>
          ) : null}
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-stone-200 shadow-sm my-6">
          <span className="text-3xl sm:text-4xl block mb-2">🔍</span>
          <h3 className="font-bold text-stone-700 text-sm">No encontramos resultados</h3>
          <p className="text-xs text-stone-400 mt-1">Intentá buscar con otro término o seleccionando otra categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {filteredProducts.map((product) => {
            const rawImages = Array.isArray(product.images) && product.images.length > 0
              ? product.images
              : [product.image || 'https://via.placeholder.com/300x300?text=SantoMate'];

            const imagesList = rawImages.filter(Boolean);
            const hasMultipleImages = Boolean(imagesList && imagesList.length > 1);
            const currentImgIndex = (cardImageIndices[product.id] || 0) % (imagesList.length || 1);
            const currentCardImage = imagesList[currentImgIndex];

            const isOutOfStock = Boolean(product.stock !== undefined && product.stock <= 0);
            const hasColors = Boolean(Array.isArray(product.colors) && product.colors.length > 0);
            const activeColor = selectedCardColors[product.id] || (hasColors ? product.colors[0] : null);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group min-w-0"
              >
                {/* Contenedor de Imagen */}
                <div 
                  className="relative aspect-square bg-stone-50 overflow-hidden cursor-pointer select-none p-3 sm:p-4 flex items-center justify-center"
                  onClick={() => handleOpenModal(product)}
                >
                  <img
                    src={currentCardImage}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {hasMultipleImages ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handlePrevCardImage(e, product.id, imagesList.length)}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-2xs transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-md active:scale-90"
                        title="Foto anterior"
                      >
                        <span className="text-xs sm:text-sm font-black leading-none pointer-events-none">‹</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleNextCardImage(e, product.id, imagesList.length)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-2xs transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-md active:scale-90"
                        title="Siguiente foto"
                      >
                        <span className="text-xs sm:text-sm font-black leading-none pointer-events-none">›</span>
                      </button>

                      <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center items-center gap-1 pointer-events-none">
                        {imagesList.map((_, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`rounded-full transition-all ${
                              currentImgIndex === dotIdx
                                ? 'w-3 h-1 bg-amber-400 shadow-xs'
                                : 'w-1 h-1 bg-stone-400/60'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}

                  <span className="absolute top-2 left-2 bg-stone-900/80 text-stone-100 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs truncate max-w-[110px] pointer-events-none">
                    {getCategoryLabel(product.category)}
                  </span>

                  {Boolean(product.featured) ? (
                    <span className="absolute top-2 right-2 bg-amber-400 text-emerald-950 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow pointer-events-none">
                      ★
                    </span>
                  ) : null}

                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center pointer-events-none">
                      <span className="bg-red-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-lg shadow uppercase">
                        Sin Stock
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Info de Producto */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div className="cursor-pointer" onClick={() => handleOpenModal(product)}>
                    <h3 className="font-bold text-stone-800 text-xs sm:text-base group-hover:text-emerald-900 transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {hasColors ? (
                    <div className="hidden sm:block pt-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Color: <span className="text-stone-800 font-extrabold">{activeColor}</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleSelectCardColor(product.id, color)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                              activeColor === color
                                ? 'bg-emerald-950 text-amber-300 border-emerald-950 shadow-2xs'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-stone-400 block font-semibold uppercase">Precio</span>
                      <span className="text-sm sm:text-lg font-black text-emerald-950">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddFromCard(product, activeColor);
                      }}
                      disabled={isOutOfStock}
                      className={`w-full sm:w-auto font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 active:scale-95 ${
                        isOutOfStock 
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-white'
                      }`}
                    >
                      <span>🛒</span> <span>{isOutOfStock ? 'Agotado' : 'Agregar'}</span>
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
        const rawModalImages = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
          ? selectedProduct.images
          : [selectedProduct.image || 'https://via.placeholder.com/500x500?text=SantoMate'];

        const modalImages = rawModalImages.filter(Boolean);
        const currentActiveImg = modalImages[activeImageIndex] || modalImages[0];
        const isOutOfStock = Boolean(selectedProduct.stock !== undefined && selectedProduct.stock <= 0);
        const hasColors = Boolean(Array.isArray(selectedProduct.colors) && selectedProduct.colors.length > 0);

        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl relative border border-stone-100 my-auto flex flex-col animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón Cerrar (✕) */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-5 sm:top-5 sm:right-6 text-stone-400 hover:text-stone-700 text-2xl font-bold transition-colors p-2 z-20 cursor-pointer"
                title="Cerrar"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
                
                {/* 1. COLUMNA IZQUIERDA: Info, Precios y Acciones */}
                <div className="md:col-span-5 flex flex-col justify-center order-2 md:order-1">
                  
                  <span className="self-start text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-[#E8F8F0] px-3 py-1 rounded-md mb-3">
                    {getCategoryLabel(selectedProduct.category)}
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight mb-3">
                    {selectedProduct.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-500 font-normal leading-relaxed mb-6">
                    {selectedProduct.description || "Tradición y diseño en un solo mate. Fabricado artesanalmente para disfrutar de la mejor experiencia matera."}
                  </p>

                  {hasColors && (
                    <div className="mb-5">
                      <span className="block text-[11px] font-bold uppercase text-stone-500 mb-1.5">
                        Color / Modelo: <strong className="text-emerald-950">{modalSelectedColor}</strong>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setModalSelectedColor(color)}
                            className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all border ${
                              modalSelectedColor === color
                                ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xs'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-2xl sm:text-3xl font-black text-stone-900 mb-6 tracking-tight">
                    {formatPrice(selectedProduct.price)}
                  </div>

                  <div className="inline-flex items-center border border-stone-200 rounded-xl px-2 py-1 w-fit mb-5 bg-stone-50/50 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-black text-base transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-stone-900">
                      {modalQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => q + 1)}
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-black text-base transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart({
                        ...selectedProduct,
                        quantity: modalQuantity,
                        selectedColor: modalSelectedColor,
                        image: currentActiveImg
                      });
                      handleCloseModal();
                    }}
                    disabled={isOutOfStock}
                    className={`w-full sm:w-auto font-bold text-xs sm:text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                      isOutOfStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                        : 'bg-[#064e3b] hover:bg-[#043d2e] text-white cursor-pointer'
                    }`}
                  >
                    <span>🛒</span>
                    <span>{isOutOfStock ? 'Sin Stock Disponible' : 'Agregar al carrito'}</span>
                  </button>

                </div>

                {/* 2. COLUMNA CENTRAL: Imagen Grande */}
                <div className="md:col-span-5 flex items-center justify-center py-2 order-1 md:order-2">
                  <div className="w-full max-w-[320px] sm:max-w-[380px] aspect-square flex items-center justify-center p-2 relative">
                    <img
                      src={currentActiveImg}
                      alt={selectedProduct.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-all duration-300"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                        <span className="bg-red-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg uppercase tracking-wider">
                          Sin Stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. COLUMNA DERECHA: Miniaturas */}
                <div className="md:col-span-2 flex md:flex-col gap-2.5 justify-center items-center overflow-x-auto md:overflow-y-auto max-h-[380px] py-1 order-3">
                  {modalImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 p-1 bg-stone-50/50 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx 
                          ? 'border-[#064e3b] shadow-2xs scale-102' 
                          : 'border-stone-200/90 hover:border-stone-400 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Vista ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>

              </div>

            </div>
          </div>
        );
      })()}
    </section>
  );
};