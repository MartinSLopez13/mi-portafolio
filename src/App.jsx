import React, { useState, useEffect, useCallback } from 'react';

// Conector de la API Node.js / MySQL
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getStoredUser,
  logoutUser
} from './api/client';

// Componentes del proyecto
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { ClientLogos } from './components/ClientLogos';
import { ShippingBenefits } from './components/ShippingBenefits';
import { ProductsGrid } from './components/ProductsGrid';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Estado para Pedidos
  const [orders, setOrders] = useState([]);

  // Estados de interfaz y usuario
  const [currentView, setCurrentView] = useState('shop'); // 'shop' | 'admin'
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Helper para verificar si el usuario logueado tiene permisos de administrador
  const checkIsAdmin = (user) => {
    return Boolean(user && (user.isAdmin === true || user.role === 'admin' || user.is_admin === 1 || user.is_admin === true));
  };

  const isUserAdmin = checkIsAdmin(currentUser);

  // 1. Cargar usuario logueado almacenado en localStorage al iniciar
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // 1.1 Capturar diseño proveniente del Diseñador Online (/personalizador)
  useEffect(() => {
    const pendingCustomItem = localStorage.getItem('santo_pending_custom_item');

    if (pendingCustomItem) {
      try {
        const item = JSON.parse(pendingCustomItem);

        // Agregamos el producto personalizado al carrito
        setCart((prevCart) => {
          const exists = prevCart.some((p) => p.id === item.id);
          return exists ? prevCart : [...prevCart, item];
        });

        // Abrimos el carrito automáticamente para mostrar el mockup diseñado
        setIsCartOpen(true);

        // Limpiamos la clave para evitar duplicados si recarga con F5
        localStorage.removeItem('santo_pending_custom_item');

        // Limpiamos el query param ?action=openCart de la URL sin recargar
        if (window.location.search.includes('action=openCart')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error("Error al procesar el producto personalizado:", err);
      }
    }
  }, []);

  // 2. Función para cargar productos desde la base de datos MySQL
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos desde la API:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Función para cargar pedidos (solo si el usuario actual es admin)
  const fetchOrders = useCallback(async () => {
    if (!isUserAdmin) return;
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar pedidos desde la API:", error);
    }
  }, [isUserAdmin]);

  useEffect(() => {
    if (isUserAdmin) {
      fetchOrders();
    }
  }, [isUserAdmin, fetchOrders]);

  // 4. Funciones CRUD de Productos
  const handleAddProduct = async (newProduct) => {
    try {
      await createProduct(newProduct);
      await fetchProducts();
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Hubo un error al guardar el producto.");
    }
  };

  const handleUpdateProduct = async (id, updatedFields) => {
    try {
      await updateProduct(id, updatedFields);
      await fetchProducts();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("Hubo un error al actualizar el producto.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Hubo un error al eliminar el producto.");
    }
  };

  // 5. Funciones para Pedidos (Orders)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      alert("Error al cambiar el estado del pedido.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("¿Seguro que querés eliminar este pedido del registro?")) return;
    try {
      await deleteOrder(orderId);
      await fetchOrders();
    } catch (error) {
      console.error("Error al eliminar el pedido:", error);
      alert("Error al eliminar el pedido.");
    }
  };

  // 6. Registrar pedido y descontar stock automáticamente
  const handleCreateOrder = async (customerDetails) => {
    if (cart.length === 0) return;

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrderData = {
      customer: customerDetails || {
        name: currentUser?.name || 'Cliente SantoMate',
        email: currentUser?.email || 'sin-email@santomate.com',
        phone: customerDetails?.phone || currentUser?.phone || '-',
        address: customerDetails?.address || 'Retiro en local'
      },
      items: cart.map((item) => ({
        id: item.id,
        name: item.details ? `${item.name} (${item.details})` : item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        image: item.image || item.images?.[0] || ''
      })),
      total: total
    };

    try {
      await createOrder(newOrderData);
      await fetchProducts(); // Refresca el stock
      if (isUserAdmin) {
        await fetchOrders();
      }
      handleClearCart();
      setIsCartOpen(false);
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      alert("Hubo un error al procesar el pedido. Por favor intentá nuevamente.");
    }
  };

  // 7. Cierre de Sesión
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentView('shop');
  };

  // 8. Manejo del Carrito con Stock, Colores y Personalizados
  const handleAddToCart = (product) => {
    const availableStock = product.stock !== undefined ? product.stock : 10;

    setCart((prev) => {
      const exists = prev.find(
        (item) => item.id === product.id && item.selectedColor === product.selectedColor
      );

      const totalQtyInCart = prev
        .filter((item) => item.id === product.id)
        .reduce((acc, item) => acc + item.quantity, 0);

      if (totalQtyInCart + 1 > availableStock) {
        alert(`¡Atención! Solo quedan ${availableStock} unidades disponibles de este producto.`);
        return prev;
      }

      if (exists) {
        return prev.map((item) =>
          item.id === product.id && item.selectedColor === product.selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQuantity, selectedColor) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id, selectedColor);
      return;
    }

    // Si es un ítem personalizado no validamos contra el stock de la base de datos
    const isCustomItem = typeof id === 'string' && id.startsWith('custom-');
    const realProduct = products.find((p) => p.id === id);
    const availableStock = isCustomItem ? 99 : (realProduct?.stock !== undefined ? realProduct.stock : 99);

    setCart((prev) => {
      const otherItemsQty = prev
        .filter((item) => item.id === id && item.selectedColor !== selectedColor)
        .reduce((acc, item) => acc + item.quantity, 0);

      if (otherItemsQty + newQuantity > availableStock) {
        alert(`No podés agregar más de ${availableStock} unidades en total de este producto.`);
        return prev;
      }

      return prev.map((item) =>
        item.id === id && item.selectedColor === selectedColor
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const handleRemoveItem = (id, selectedColor) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedColor === selectedColor))
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col justify-between overflow-x-hidden relative">
      <div className="w-full overflow-x-hidden">
        <AnnouncementBar />
        
        <Header 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          user={currentUser}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
        />

        {currentView === 'shop' ? (
          <main className="w-full">
            {/* Banner Principal (Video / Imagen) */}
            <HeroSlider />
            
            {/* Clientes que confían en nosotros (Marquee animado) */}
            <ClientLogos />

            {/* Envíos a todo el país (Vía Cargo, Andreani, Correo Arg, Flex) */}
            <ShippingBenefits />
            
            {/* Catálogo de Productos */}
            <section id="catalogo" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
              {loadingProducts ? (
                <div className="text-center py-20 text-stone-500 font-medium">
                  Cargando catálogo desde la base de datos...
                </div>
              ) : (
                <ProductsGrid 
                  products={products} 
                  onAddToCart={handleAddToCart} 
                />
              )}
            </section>
          </main>
        ) : (
          <AdminPanel 
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onRefreshProducts={fetchProducts}
            onGoToStore={() => {
              fetchProducts(); // Refresca productos al volver a la tienda
              setCurrentView('shop');
            }}
          />
        )}
      </div>

      <Footer />

      {/* Botón flotante para acceder al Panel Admin */}
      {isUserAdmin && currentView === 'shop' && (
        <button 
          onClick={() => setCurrentView('admin')}
          className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-700 transition-all z-40"
        >
          ⚙️ Panel Admin
        </button>
      )}

      {/* Botón Flotante Oficial de WhatsApp */}
      <a
        href="https://wa.me/5491124060155?text=Hola!%20Quería%20hacer%20una%20consulta%20sobre%20los%20artículos%20materos"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white/40 group"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/35 animate-ping -z-10 pointer-events-none" />
        <svg 
          className="w-7 h-7 fill-white drop-shadow-sm" 
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        <span className="hidden sm:group-hover:flex items-center gap-1.5 absolute right-full mr-3 bg-stone-900/95 text-white text-xs font-semibold py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl border border-stone-700 pointer-events-none transition-all duration-200">
          ¿Tenés dudas? Escribinos
        </span>
      </a>

      {/* Modales y Drawers */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCreateOrder={handleCreateOrder}
        user={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={(userData) => setCurrentUser(userData)}
      />
    </div>
  );
}