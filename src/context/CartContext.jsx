import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // --- NUEVOS ESTADOS PARA EL BUSCADOR ---
  const [searchTerm, setSearchTerm] = useState("");
  const productsRef = useRef(null); // Referencia para el scroll

  // Efecto que hace el scroll automático al escribir
  useEffect(() => {
    if (searchTerm.length > 0 && productsRef.current) {
      productsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [searchTerm]);

  // MODIFICADO: addToCart ahora respeta las nuevas propiedades de precio e IVA
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Al agregar por primera vez, se guarda con 'precioCongelado' y 'verConIvaEnPedido'
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // NUEVO: Calcular el total general del carrito leyendo el precio congelado correcto
  const cartTotal = cartItems.reduce((total, item) => {
    // Si por alguna razón no viene el precioCongelado, usamos precioConIva por las dudas
    const precioUnitario = item.precioCongelado !== undefined ? item.precioCongelado : (Number(item.precioConIva) || 0);
    return total + (precioUnitario * item.quantity);
  }, 0);

  // NUEVO: Bandera para saber si el pedido actual se está calculando Con o Sin IVA
  // Miramos el primer ítem del carrito para deducir la condición del usuario
  const esPedidoConIva = cartItems.length > 0 ? cartItems[0].verConIvaEnPedido : true;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,       // <-- Exportamos el Total calculado de forma dinámica
      esPedidoConIva,  // <-- Exportamos si el pedido es Neto o Con IVA para el Checkout/EmailJS
      isCartOpen,
      setIsCartOpen,
      searchTerm,
      setSearchTerm,
      productsRef
    }}>
      {children}
    </CartContext.Provider>
  );
};