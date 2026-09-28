import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

export const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cart = [], 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  onCreateOrder,
  user,          // Info del usuario logueado
  onOpenLogin    
}) => {
  const MINIMUM_PURCHASE = 100000;
  const currentCart = cartItems || cart || [];

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // 1. Cargar datos del usuario al abrir el carrito
  useEffect(() => {
    if (user && isOpen) {
      setCustomerInfo((prev) => {
        const emailPrefix = user.email ? user.email.split('@')[0] : '';
        const isGenericName = !user.name || user.name === emailPrefix || user.name.includes('@');

        return {
          ...prev,
          name: prev.name ? prev.name : (!isGenericName ? user.name : ''),
          phone: prev.phone ? prev.phone : (user.phone || ''),
        };
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const total = currentCart.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 
    0
  );

  const isMinimumReached = total >= MINIMUM_PURCHASE;
  const amountNeeded = Math.max(0, MINIMUM_PURCHASE - total);
  const progressPercent = Math.min(100, (total / MINIMUM_PURCHASE) * 100);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Obtener valores finales limpios
  const getFinalCustomerData = () => {
    const emailPrefix = user?.email ? user.email.split('@')[0] : '';
    const isGenericName = !user?.name || user?.name === emailPrefix || user?.name.includes('@');

    const finalName = customerInfo.name.trim() 
      ? customerInfo.name.trim() 
      : (!isGenericName ? user.name : 'Cliente');

    const finalPhone = customerInfo.phone.trim() 
      ? customerInfo.phone.trim() 
      : (user?.phone || 'No especificado');

    // Identificador único o número de cliente en sesión
    const customerNumber = user?.id || user?._id || user?.cliente_id || 'S/N';

    return { finalName, finalPhone, customerNumber };
  };

  const generateOrderMessage = () => {
    const { finalName, finalPhone, customerNumber } = getFinalCustomerData();

    let message = "🚨 NUEVO PEDIDO MAYORISTA - SANTOMATE\n\n";
    
    message += "DATOS DEL CLIENTE:\n";
    message += `• N° de Cliente: #${customerNumber}\n`; // <-- Solo en el correo
    message += `• Nombre / Razón Social: ${finalName}\n`;
    message += `• Email de cuenta: ${user?.email || 'No especificado'}\n`;
    message += `• Teléfono: ${finalPhone}\n`;
    message += `• Dirección de Entrega: ${customerInfo.address || 'No especificado'}\n`;
    if (customerInfo.notes.trim()) {
      message += `• Notas del pedido: ${customerInfo.notes}\n`;
    }
    message += "\n-----------------------------------\n\n";

    message += "DETALLE DEL PEDIDO:\n";
    currentCart.forEach((item) => {
      const colorText = item.selectedColor ? ` (Color: ${item.selectedColor})` : '';
      const customText = item.details ? ` [${item.details}]` : '';
      message += `• ${item.name}${colorText}${customText} x${item.quantity} - ${formatPrice((item.price || 0) * item.quantity)}\n`;
    });

    message += `\nTOTAL ESTIMADO: ${formatPrice(total)}\n\n`;
    message += "Por favor, contáctenme para coordinar el pago y envío.";

    return message;
  };

  const handleSendOrder = async (e) => {
    e.preventDefault();

    if (!isMinimumReached) {
      alert(`El pedido mínimo es de ${formatPrice(MINIMUM_PURCHASE)}.`);
      return;
    }

    if (!user) {
      alert("Debés iniciar sesión para realizar un pedido.");
      if (onOpenLogin) onOpenLogin();
      return;
    }

    if (currentCart.length === 0) return;

    setIsSending(true);

    const { finalName, finalPhone, customerNumber } = getFinalCustomerData();

    const SERVICE_ID = "service_1ydjq0s";
    const TEMPLATE_ID = "template_35fkmr8";
    const PUBLIC_KEY = "q86WOFlgVZm_rZ0YX";

    // Parámetros para EmailJS: viaje del N° de cliente y asunto en rojo
    const templateParams = {
      to_name: "SantoMate Ventas",
      from_name: finalName,
      subject: `🚨 Compra Nueva - #${customerNumber} ${finalName}`, 
      customer_number: customerNumber, // Disponible como {{customer_number}} en el template
      customer_phone: finalPhone,
      message: generateOrderMessage(),
    };

    try {
      // 1. Enviar email por EmailJS
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

      // 2. Guardar orden en base de datos de Hostinger intacta
      if (onCreateOrder) {
        await onCreateOrder({
          name: finalName,
          email: user.email,
          phone: finalPhone,
          address: customerInfo.address,
          notes: customerInfo.notes
        });
      } else {
        onClearCart();
      }

      setOrderSent(true);
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Hubo un error al procesar el pedido. Por favor, intentá nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setOrderSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col relative z-10">
          
          {/* Header */}
          <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🛒 Tu Carrito ({currentCart.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>
            <button 
              onClick={handleClose}
              className="text-white hover:text-gray-300 text-2xl font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Estado: Pedido Confirmado */}
          {orderSent ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-3xl font-bold">
                ✓
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">¡Pedido Recibido!</h3>
              <p className="text-sm text-gray-600">
                Muchas gracias por tu compra. Nos pondremos en contacto a la brevedad para coordinar el pago y la entrega.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            <>
              {/* Contenido principal */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {currentCart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 space-y-3">
                    <p className="text-4xl">🛍️</p>
                    <p className="font-semibold text-lg">Tu carrito está vacío</p>
                    <p className="text-sm">Agregá productos desde el catálogo para iniciar tu compra.</p>
                  </div>
                ) : (
                  <>
                    {/* Lista de productos */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Productos Seleccionados
                      </h3>
                      {currentCart.map((item, index) => {
                        const isCustom = item.isCustom || (typeof item.id === 'string' && item.id.startsWith('custom-'));
                        const itemImage = item.image || item.images?.[0] || "https://via.placeholder.com/80";

                        return (
                          <div 
                            key={`${item.id}-${item.selectedColor || index}`} 
                            className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                              isCustom 
                                ? 'bg-amber-50/40 border-amber-200/80 shadow-sm' 
                                : 'bg-gray-50 border-gray-100'
                            }`}
                          >
                            <img 
                              src={itemImage} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded-lg bg-white border shrink-0"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-sm font-bold text-gray-800 truncate">{item.name}</h4>
                                {isCustom && (
                                  <span className="bg-amber-500 text-emerald-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                    ✨ Personalizado
                                  </span>
                                )}
                              </div>
                              
                              {item.details ? (
                                <p className="text-[11px] text-amber-900/80 font-semibold mt-0.5">
                                  {item.details}
                                </p>
                              ) : item.selectedColor ? (
                                <span className="inline-block bg-emerald-100/80 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md mt-0.5 border border-emerald-200/50">
                                  Color: {item.selectedColor}
                                </span>
                              ) : null}

                              <p className="text-xs text-emerald-800 font-bold mt-1">
                                {formatPrice(item.price)}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <button 
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.selectedColor)}
                                  className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 font-bold text-xs flex items-center justify-center text-gray-700"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-gray-800 px-1">{item.quantity}</span>
                                <button 
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.selectedColor)}
                                  className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 font-bold text-xs flex items-center justify-center text-gray-700"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end justify-between self-stretch py-1">
                              <button 
                                onClick={() => onRemoveItem(item.id, item.selectedColor)}
                                className="text-gray-400 hover:text-red-500 text-xs font-bold transition-colors"
                                title="Eliminar ítem"
                              >
                                🗑️
                              </button>
                              <span className="text-sm font-extrabold text-gray-900 mt-2">
                                {formatPrice((item.price || 0) * item.quantity)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* BLOQUE DE AUTENTICACIÓN / FORMULARIO */}
                    {!user ? (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3">
                        <span className="text-2xl block">🔒</span>
                        <h4 className="font-bold text-amber-900 text-sm">Inicio de sesión requerido</h4>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Para completar tu pedido y vincularlo a tu cuenta de SantoMate, tenés que iniciar sesión.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onOpenLogin) onOpenLogin();
                          }}
                          className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow"
                        >
                          🔑 Iniciar Sesión / Registrarse
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Datos para la Entrega
                          </h3>
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            👤 {user.email}
                          </span>
                        </div>

                        <form id="orderForm" onSubmit={handleSendOrder} className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nombre / Razón Social *
                            </label>
                            <input
                              type="text"
                              name="name"
                              required
                              value={customerInfo.name}
                              onChange={handleInputChange}
                              placeholder="Ej: Juan Pérez / Baires SRL"
                              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-700"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Teléfono *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                required
                                value={customerInfo.phone}
                                onChange={handleInputChange}
                                placeholder="Ej: 11 2233-4455"
                                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-700"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Dirección / Localidad
                              </label>
                              <input
                                type="text"
                                name="address"
                                value={customerInfo.address}
                                onChange={handleInputChange}
                                placeholder="Ej: Av. Corrientes 1234, CABA"
                                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Notas del Pedido (Opcional)
                            </label>
                            <textarea
                              name="notes"
                              rows="2"
                              value={customerInfo.notes}
                              onChange={handleInputChange}
                              placeholder="Aclaraciones sobre transporte, colores, embalaje..."
                              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-700 resize-none"
                            />
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {currentCart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                  
                  {/* Meta de Compra Mínima */}
                  <div className="bg-white border border-stone-200 p-3.5 rounded-xl shadow-2xs">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className={isMinimumReached ? "text-emerald-700 font-bold flex items-center gap-1" : "text-amber-800"}>
                        {isMinimumReached 
                          ? "✓ ¡Superaste el monto mínimo mayorista!" 
                          : `Te faltan ${formatPrice(amountNeeded)} para el mínimo`}
                      </span>
                      <span className="text-stone-500 font-mono text-[11px]">
                        {formatPrice(total)} / {formatPrice(MINIMUM_PURCHASE)}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isMinimumReached ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {!isMinimumReached && (
                      <p className="text-[11px] text-stone-500 mt-2 font-medium">
                        El mínimo de compra para despachos mayoristas es de <strong>{formatPrice(MINIMUM_PURCHASE)}</strong>.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-lg font-black text-gray-900">
                    <span>Total Estimado:</span>
                    <span className="text-emerald-900 font-mono">{formatPrice(total)}</span>
                  </div>

                  {user ? (
                    <button
                      type="submit"
                      form="orderForm"
                      disabled={isSending || !isMinimumReached}
                      className={`w-full font-bold py-3.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${
                        !isMinimumReached 
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 shadow-none'
                          : isSending 
                            ? 'bg-emerald-800 text-white opacity-50 cursor-not-allowed' 
                            : 'bg-emerald-800 hover:bg-emerald-900 text-white active:scale-[0.99] cursor-pointer'
                      }`}
                    >
                      {isSending 
                        ? "Enviando Pedido..." 
                        : !isMinimumReached
                          ? `Mínimo Requerido: ${formatPrice(MINIMUM_PURCHASE)}`
                          : "✉️ Confirmar y Enviar Pedido"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenLogin) onOpenLogin();
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black py-3.5 px-4 rounded-xl shadow transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      🔒 Iniciar Sesión para Confirmar
                    </button>
                  )}

                  <button 
                    onClick={onClearCart}
                    className="w-full text-center text-xs text-gray-400 hover:text-red-500 font-medium transition-colors pt-1"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};