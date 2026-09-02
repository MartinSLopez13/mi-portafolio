import React, { useState, useEffect, useCallback } from 'react';

// Conector de la nueva API Node.js / MySQL
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

  // 1. Cargar usuario logueado almacenado en localStorage al iniciar
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
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
    if (!currentUser?.isAdmin) return;
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar pedidos desde la API:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchOrders();
    }
  }, [currentUser, fetchOrders]);

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
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        image: item.images?.[0] || item.image || ''
      })),
      total: total
    };

    try {
      await createOrder(newOrderData);
      await fetchProducts(); // Refresca el stock de los productos actualizados
      if (currentUser?.isAdmin) {
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

  // 8. Manejo del Carrito con Stock y Colores
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

    const realProduct = products.find((p) => p.id === id);
    const availableStock = realProduct?.stock !== undefined ? realProduct.stock : 99;

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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col justify-between">
      <div>
        <AnnouncementBar />
        
        <Header 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          user={currentUser}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
        />

        {currentView === 'shop' ? (
          <>
            <HeroSlider />
            
            <div id="catalogo">
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
            </div>
          </>
        ) : (
          <AdminPanel 
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onGoToStore={() => setCurrentView('shop')}
          />
        )}
      </div>

      <Footer />

      {/* Botón flotante para acceder al Panel Admin */}
      {currentUser?.isAdmin && currentView === 'shop' && (
        <button 
          onClick={() => setCurrentView('admin')}
          className="fixed bottom-5 right-5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-700 transition-all z-40"
        >
          ⚙️ Panel Admin
        </button>
      )}

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