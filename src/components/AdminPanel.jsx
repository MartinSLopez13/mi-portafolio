import React, { useState, useEffect, useCallback } from 'react';
import { getBanners, createBanner, deleteBanner, updateProductsOrder } from '../api/client';

export const AdminPanel = ({ 
  products = [], 
  orders = [], 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onUpdateOrderStatus,
  onDeleteOrder,
  onRefreshProducts,
  onGoToStore 
}) => {
  // Pestaña activa: 'products' | 'banners' | 'orders'
  const [activeTab, setActiveTab] = useState('products');

  // Listado completo de categorías disponibles
  const categories = [
    { id: 'mates', name: 'Mates' },
    { id: 'termos', name: 'Termos' },
    { id: 'bombillas', name: 'Bombillas' },
    { id: 'set-materos', name: 'Sets Azucar/Yerba' },
    { id: 'termicos', name: 'Termicos' },
    { id: 'combos', name: 'Combos' },
    { id: 'vasos', name: 'Vasos' },
    { id: 'canasta', name: 'Canasta/Bolsos' },
    { id: 'pavas', name: 'Pavas' },
    { id: 'varios', name: 'Varios' },
  ];

  // --- REORDENAMIENTO DE PRODUCTOS ---
  const [orderedProducts, setOrderedProducts] = useState(products);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    setOrderedProducts(products);
    setHasOrderChanged(false);
  }, [products]);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...orderedProducts];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setOrderedProducts(updated);
    setHasOrderChanged(true);
  };

  const handleMoveDown = (index) => {
    if (index === orderedProducts.length - 1) return;
    const updated = [...orderedProducts];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setOrderedProducts(updated);
    setHasOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    console.log('>>> 1. BOTÓN TOCADO: INICIANDO GUARDADO <<<');
    try {
      setIsSavingOrder(true);
      
      const orderedIds = orderedProducts.map((p) => Number(p.id));
      console.log('>>> 2. IDs A ENVIAR:', orderedIds);

      const respuesta = await updateProductsOrder(orderedIds);
      console.log('>>> 3. RESPUESTA DE LA API:', respuesta);
      
      setHasOrderChanged(false);
      alert('¡Orden de productos guardado con éxito!');
      
      if (onRefreshProducts) {
        console.log('>>> 4. REFLEJANDO PRODUCTOS EN PANTALLA <<<');
        await onRefreshProducts();
      }
    } catch (error) {
      console.error('>>> ERROR ATRAPADO EN ADMIN PANEL:', error);
      alert('Hubo un error al guardar el orden: ' + error.message);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // --- CONFIRMACIÓN DE SEGURIDAD PARA ELIMINAR ---
  const handleDeleteProductWithConfirmation = (product) => {
    const confirmed = window.confirm(
      `⚠️ ¿Estás seguro de que querés ELIMINAR este producto?\n\n"${product.name}"\n\nEsta acción quitará el producto del catálogo de la tienda y no se puede deshacer.`
    );

    if (confirmed) {
      onDeleteProduct(product.id);
    }
  };

  // --- ESTADOS PRODUCTOS ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'mates',
    price: '',
    stock: '',
    colorsText: '',
    imagesText: '',
    description: '',
    featured: false,
  });

  // --- ESTADOS BANNERS ---
  const [banners, setBanners] = useState([]);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'OFERTA DESTACADA',
    image: '',
    ctaText: 'Ver Productos'
  });

  const fetchBanners = useCallback(async () => {
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error("Error al cargar banners:", error);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // --- MANEJO DE PRODUCTOS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.stock === '') {
      alert('Por favor completá el nombre, precio y stock.');
      return;
    }

    const imagesArray = formData.imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const finalImages = imagesArray.length > 0 
      ? imagesArray 
      : ['https://via.placeholder.com/300x300?text=SantoMate'];

    const colorsArray = formData.colorsText
      .split(/,|\n/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const newProductData = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      colors: colorsArray,
      description: formData.description,
      featured: formData.featured,
      images: finalImages,
      image: finalImages[0]
    };

    if (editingId) {
      onUpdateProduct(editingId, newProductData);
      setEditingId(null);
    } else {
      onAddProduct(newProductData);
    }

    setFormData({
      name: '',
      category: 'mates',
      price: '',
      stock: '',
      colorsText: '',
      imagesText: '',
      description: '',
      featured: false,
    });
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    const existingImagesText = Array.isArray(product.images) && product.images.length > 0
      ? product.images.join('\n')
      : (product.image || '');

    const existingColorsText = Array.isArray(product.colors)
      ? product.colors.join(', ')
      : '';

    setFormData({
      name: product.name,
      category: product.category || 'mates',
      price: product.price,
      stock: product.stock !== undefined ? product.stock : 10,
      colorsText: existingColorsText,
      imagesText: existingImagesText,
      description: product.description || '',
      featured: Boolean(product.featured),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'mates',
      price: '',
      stock: '',
      colorsText: '',
      imagesText: '',
      description: '',
      featured: false,
    });
  };

  // --- MANEJO DE BANNERS ---
  const handleBannerInputChange = (e) => {
    const { name, value } = e.target;
    setBannerFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitBanner = async (e) => {
    e.preventDefault();
    if (!bannerFormData.title || !bannerFormData.image) {
      alert("Por favor completá el título y la URL de la imagen del banner.");
      return;
    }

    try {
      await createBanner(bannerFormData);
      await fetchBanners();
      setBannerFormData({
        title: '',
        subtitle: '',
        badge: 'OFERTA DESTACADA',
        image: '',
        ctaText: 'Ver Productos'
      });
      alert("¡Banner publicado con éxito!");
    } catch (error) {
      console.error("Error al guardar banner:", error);
      alert("Hubo un error al guardar el banner.");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar este banner de la portada?")) return;
    try {
      await deleteBanner(id);
      await fetchBanners();
    } catch (error) {
      console.error("Error al eliminar banner:", error);
      alert("Hubo un error al eliminar el banner.");
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalFacturado = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
  const pedidosPendientes = orders.filter(o => o.status === 'Pendiente' || !o.status).length;

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Navbar Superior del Admin */}
      <header className="bg-emerald-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="font-extrabold text-xl tracking-wide">SantoMate - Panel Admin</h1>
              <p className="text-xs text-emerald-300">Gestión de Catálogo, Pedidos y Banners</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-amber-500 text-emerald-950 shadow'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-stone-200'
              }`}
            >
              📦 Productos ({orderedProducts.length})
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-emerald-950 shadow'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-stone-200'
              }`}
            >
              📋 Pedidos ({orders.length})
              {pedidosPendientes > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  {pedidosPendientes}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'banners'
                  ? 'bg-amber-500 text-emerald-950 shadow'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-stone-200'
              }`}
            >
              🖼️ Banners ({banners.length})
            </button>

            <button
              onClick={onGoToStore}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 ml-2 cursor-pointer"
            >
              🏪 Tienda
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN 1: GESTIÓN DE PRODUCTOS */}
      {activeTab === 'products' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
              <span>{editingId ? '✏️ Editar Producto' : '➕ Agregar Producto'}</span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-red-500 hover:underline font-normal"
                >
                  Cancelar edición
                </button>
              )}
            </h2>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del producto *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Mate Imperial Calabaza"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Categoría *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Precio (ARS) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Ej. 18500"
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Ej. 10"
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Colores / Variantes (Separados por comas)
                </label>
                <input
                  type="text"
                  name="colorsText"
                  value={formData.colorsText}
                  onChange={handleInputChange}
                  placeholder="Ej: Negro, Suela, Marrón, Borravino"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Si dejas este campo vacío, el producto se creará sin variantes de color.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URLs de Imágenes (Una por línea)
                </label>
                <textarea
                  name="imagesText"
                  rows="3"
                  value={formData.imagesText}
                  onChange={handleInputChange}
                  placeholder={'https://ejemplo.com/foto1.jpg\nhttps://ejemplo.com/foto2.jpg'}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700 font-mono resize-y"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Pegá la URL de cada imagen en una línea distinta. La primera será la portada.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detalles sobre materiales, origen, medidas..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="rounded text-emerald-700 focus:ring-emerald-700"
                />
                <label htmlFor="featured" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Destacar en la portada de la tienda
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-colors text-xs mt-2 cursor-pointer"
              >
                {editingId ? 'Guardar Cambios' : 'Guardar Producto'}
              </button>
            </form>
          </div>

          {/* Lista de Productos Reordenable */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                📦 Catálogo Actual ({orderedProducts.length})
              </h2>

              {hasOrderChanged && (
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={isSavingOrder}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer"
                >
                  💾 {isSavingOrder ? 'Guardando orden...' : 'Guardar Nuevo Orden'}
                </button>
              )}
            </div>

            {orderedProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🍃</p>
                <p className="text-sm font-medium">No hay productos cargados en el catálogo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-[11px] uppercase tracking-wider">
                      <th className="pb-3 pl-2 text-center w-16">Posición</th>
                      <th className="pb-3 pl-2">Producto</th>
                      <th className="pb-3">Categoría</th>
                      <th className="pb-3">Precio</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3 text-right pr-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {orderedProducts.map((product, index) => {
                      const currentStock = product.stock ?? 0;
                      const imageCount = Array.isArray(product.images) 
                        ? product.images.length 
                        : (product.image ? 1 : 0);
                      const displayImg = Array.isArray(product.images) && product.images.length > 0 
                        ? product.images[0] 
                        : (product.image || 'https://via.placeholder.com/300x300?text=SantoMate');

                      const categoryObj = categories.find(c => c.id === product.category);
                      const categoryName = categoryObj ? categoryObj.name : (product.category || 'Mates');

                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          {/* BOTONES DE REORDENAMIENTO */}
                          <td className="py-3 pl-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-25 disabled:cursor-not-allowed text-stone-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
                                title="Subir producto"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === orderedProducts.length - 1}
                                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-25 disabled:cursor-not-allowed text-stone-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
                                title="Bajar producto"
                              >
                                ▼
                              </button>
                            </div>
                          </td>

                          <td className="py-3 pl-2 flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={displayImg}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-gray-50"
                              />
                              {imageCount > 1 && (
                                <span className="absolute -top-1 -right-1 bg-emerald-950 text-white text-[9px] font-bold px-1 rounded-full shadow">
                                  +{imageCount - 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{product.name}</p>
                              
                              {Array.isArray(product.colors) && product.colors.length > 0 && (
                                <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">
                                  🎨 {product.colors.join(', ')}
                                </p>
                              )}

                              {Boolean(product.featured) && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded inline-block mt-0.5">
                                  ★ Destacado
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-gray-600 font-medium">{categoryName}</td>
                          <td className="py-3 font-bold text-emerald-900">{formatPrice(product.price)}</td>
                          <td className="py-3">
                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              currentStock > 0 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {currentStock > 0 ? `${currentStock} un.` : 'Sin stock'}
                            </span>
                          </td>
                          <td className="py-3 text-right pr-2 space-x-2">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded transition-colors text-[11px] cursor-pointer"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProductWithConfirmation(product)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded transition-colors text-[11px] cursor-pointer"
                              title={`Eliminar ${product.name}`}
                            >
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* SECCIÓN 2: MIS PEDIDOS / REGISTRO DE VENTAS */}
      {activeTab === 'orders' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total de Pedidos</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{orders.length}</p>
              </div>
              <span className="text-3xl">📋</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Pendientes de Envío</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pedidosPendientes}</p>
              </div>
              <span className="text-3xl">⏳</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total Registrado</p>
                <p className="text-2xl font-black text-emerald-950 mt-1">{formatPrice(totalFacturado)}</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              📋 Registro de Ventas y Pedidos ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🛒</p>
                <p className="text-sm font-medium">Aún no se han registrado compras o pedidos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusColors = {
                    'Pendiente': 'bg-amber-100 text-amber-800 border-amber-300',
                    'En preparación': 'bg-blue-100 text-blue-800 border-blue-300',
                    'Enviado': 'bg-purple-100 text-purple-800 border-purple-300',
                    'Completado': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    'Cancelado': 'bg-red-100 text-red-800 border-red-300'
                  };

                  const customerPhone = order.customer?.phone || order.phone || order.telefono || '';
                  const cleanPhone = customerPhone.toString().replace(/[^0-9]/g, '');

                  const displayOrderId = String(order.id).length > 6 
                    ? String(order.id).slice(-6).toUpperCase() 
                    : order.id;

                  return (
                    <div 
                      key={order.id} 
                      className="p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100/50 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-800">
                              Pedido #{displayOrderId}
                            </span>
                            <span className="text-xs text-gray-400">
                              • {formatDate(order.createdAt || order.created_at || order.fecha)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs">
                            <strong className="text-gray-800 uppercase">
                              {order.customer?.name || order.name || order.cliente || 'Cliente'}
                            </strong>
                            <span className="text-gray-500">
                              ({order.customer?.email || order.email || 'Sin email'})
                            </span>

                            {cleanPhone ? (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 px-2 py-0.5 rounded-md transition-colors shadow-2xs ml-1"
                                title="Enviar mensaje de WhatsApp"
                              >
                                <span>📱 {customerPhone}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">
                                (Sin teléfono)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={order.status || 'Pendiente'}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                              statusColors[order.status] || statusColors['Pendiente']
                            }`}
                          >
                            <option value="Pendiente">⏳ Pendiente</option>
                            <option value="En preparación">📦 En preparación</option>
                            <option value="Enviado">🚚 Enviado</option>
                            <option value="Completado">✅ Completado</option>
                            <option value="Cancelado">❌ Cancelado</option>
                          </select>

                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar pedido"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Items Comprados */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-10 h-10 object-cover rounded-lg border"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                              
                              {item.selectedColor && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                                  Color: {item.selectedColor}
                                </span>
                              )}

                              <p className="text-[11px] text-gray-500">
                                {item.quantity} un. x {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span className="text-gray-500 font-medium">
                          📍 Entrega: <strong className="text-gray-700">{order.customer?.address || order.address || 'Retiro en local'}</strong>
                        </span>
                        <div className="text-right">
                          <span className="text-gray-400 uppercase text-[10px] block font-bold">Total del pedido</span>
                          <span className="text-base font-black text-emerald-950">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* SECCIÓN 3: BANNERS */}
      {activeTab === 'banners' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🖼️ Agregar Nuevo Banner</h2>
            <form onSubmit={handleSubmitBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Etiqueta / Badge</label>
                <input
                  type="text"
                  name="badge"
                  value={bannerFormData.badge}
                  onChange={handleBannerInputChange}
                  placeholder="Ej: OFERTA DE LA SEMANA"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Título Principal *</label>
                <input
                  type="text"
                  name="title"
                  value={bannerFormData.title}
                  onChange={handleBannerInputChange}
                  placeholder="Ej: 20% OFF en Combos Imperiales"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subtítulo / Bajada</label>
                <textarea
                  name="subtitle"
                  rows="2"
                  value={bannerFormData.subtitle}
                  onChange={handleBannerInputChange}
                  placeholder="Ej: Llevando un combo de mate + bombilla obtendrás envío bonificado."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL de Imagen *</label>
                <input
                  type="url"
                  name="image"
                  value={bannerFormData.image}
                  onChange={handleBannerInputChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Texto del Botón</label>
                <input
                  type="text"
                  name="ctaText"
                  value={bannerFormData.ctaText}
                  onChange={handleBannerInputChange}
                  placeholder="Ej: Ver Ofertas"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-colors text-xs mt-2 cursor-pointer"
              >
                Publicar Banner
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              🖼️ Banners Publicados ({banners.length})
            </h2>

            {banners.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm font-medium">No hay banners cargados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
                    <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className="w-24 h-16 object-cover rounded-lg border border-gray-200" 
                    />
                    <div className="flex-1 min-w-0">
                      {banner.badge && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
                          {banner.badge}
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-gray-800 truncate mt-1">{banner.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors text-xs cursor-pointer"
                      title="Eliminar Banner"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};