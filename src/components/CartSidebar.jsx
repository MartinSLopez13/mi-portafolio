import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, CheckCircle, Send, User, Phone, MapPin, BadgeCheck, MessageSquare, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import emailjs from '@emailjs/browser';
import { auth, db } from '../Firebase/Config';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
// IMPORTAMOS LOS VENDEDORES CENTRALIZADOS
import { VENDEDORES } from '../data/vendedores'; 

const CartSidebar = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity,
    clearCart,
    cartTotal,       // 1. IMPORTAMOS EL TOTAL DINÁMICO
    esPedidoConIva   // 2. IMPORTAMOS LA CONDICIÓN DE IVA
  } = useCart();

  const navigate = useNavigate();
  const user = auth.currentUser;

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    localidad: '',
    vendedor: '1',
    comentarios: ''
  });

  useEffect(() => {
    if (isCartOpen) {
      const savedUser = localStorage.getItem('usuarioBaires');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setFormData(prev => ({
          ...prev,
          nombre: userData.nombre || '',
          telefono: userData.telefono || '',
          localidad: userData.direccion || userData.localidad || '',
          vendedor: userData.vendedor || '1' 
        }));
      }
    }
  }, [isCartOpen]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const enviarPedido = async (e) => {
    if (e) e.preventDefault();
    
    if (!user) {
        alert("Debes iniciar sesión para finalizar el pedido.");
        navigate('/login');
        return;
    }

    if (!formData.nombre || !formData.telefono) {
      alert("Por favor, completa tu nombre y un teléfono.");
      return;
    }

    setIsSending(true);

  const detallesPedidoTexto = cartItems.map(item => 
      `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    // Buscamos dinámicamente el vendedor en el array centralizado
    const codigoFormateado = formData.vendedor.trim().toUpperCase();
    const vendedorAsignado = VENDEDORES.find(v => v.codigo === codigoFormateado) || { 
      nombre: formData.vendedor === '1' ? 'Marcial Lopez' : formData.vendedor, 
      email: formData.vendedor === '1' ? 'marcial@ejemplo.com' : null 
    };

    const templateParams = {
      user_name: formData.nombre, 
      user_phone: formData.telefono,
      user_location: formData.localidad,
      vendedor_id: vendedorAsignado.nombre, 
      cart_details: detallesPedidoTexto,
      total_price: `$${cartTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, // Usa total del contexto
      user_comments: formData.comentarios,
      to_email: 'distribuidorabaires@ejemplo.com', 
      vendedor_email: vendedorAsignado.email || '',
      
      // 3. NUEVO PARÁMETRO ASIGNADO PARA TU PLANTILLA DE EMAILJS
      condicion_iva: esPedidoConIva 
        ? "Precios con IVA Incluido (Consumidor Final / Monotributista)" 
        : "Precios NETOS sin IVA (Responsable Inscripto - Sumar IVA en factura)"
    };

    try {
      // 4. GUARDAR EN FIREBASE (Se adaptó para almacenar los nuevos campos)
      const pedidoParaFirebase = {
        uid: user.uid,
        clienteNombre: formData.nombre,
        clienteTelefono: formData.telefono,
        clienteDireccion: formData.localidad,
        comentarios: formData.comentarios,
        vendedor: vendedorAsignado.nombre,
        productos: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.precioCongelado !== undefined ? item.precioCongelado : (Number(item.precioConIva) || 0),
          verConIvaEnPedido: item.verConIvaEnPedido !== undefined ? item.verConIvaEnPedido : true
        })),
        total: cartTotal,
        esPedidoConIva: esPedidoConIva,
        fecha: new Date(),
        estado: 'pendiente'
      };

      await addDoc(collection(db, "pedidos"), pedidoParaFirebase);

      // 5. ENVIAR CON EMAILJS
      try {
        await emailjs.send(
          'default_service',
          'template_fkg1a3h',
          templateParams, 
          'q86WOFlgVZm_rZ0YX'
        );
      } catch (mailError) {
        console.error("Error al enviar el correo del pedido:", mailError);
      }

      alert(`¡Pedido enviado con éxito! ${vendedorAsignado.nombre} se pondrá en contacto pronto.`);
      
      clearCart();
      setIsCartOpen(false);
      window.location.href = "/"; 

    } catch (error) {
      console.error("Error crítico en el proceso de envío:", error);
      alert("Hubo un problema al procesar tu pedido. Por favor, intenta de nuevo o avísanos por WhatsApp.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isCartOpen) return null;

  const codigoFormateado = formData.vendedor.trim().toUpperCase();
  const vendedorActual = VENDEDORES.find(v => v.codigo === codigoFormateado)?.nombre || 
                        (formData.vendedor === '1' ? 'Marcial Lopez' : formData.vendedor);

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col relative z-10">
          
          <div className="p-6 border-b flex items-center justify-between bg-cyan-500 text-white shadow-md">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="text-xl font-black uppercase tracking-tighter">Tu Pedido</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isSent ? (
              <div className="text-center py-20 space-y-4">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">¡Pedido Enviado!</h3>
                <p className="text-gray-500 font-medium">Gracias por confiar en Distribuidora Baires.</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">El carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    // Controlamos de forma segura el precio congelado del ítem
                    const precioItem = item.precioCongelado !== undefined ? item.precioCongelado : (Number(item.precioConIva) || 0);
                    return (
                      <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 items-center">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-gray-800 leading-tight mb-1">{item.name}</h3>
                          <p className="text-cyan-600 font-black text-sm">${(precioItem * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 bg-white rounded-lg border hover:bg-gray-100 transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="font-black w-4 text-center text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 bg-white rounded-lg border hover:bg-gray-100 transition-colors"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    );
                  })}
                </div>

                {user ? (
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-4 shadow-inner">
                    <h4 className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-2">Información del Pedido</h4>
                    <div className="bg-white p-3 rounded-2xl border border-cyan-100 flex items-center gap-3 shadow-sm mb-4">
                      <BadgeCheck className="w-6 h-6 text-cyan-500" />
                      <div>
                        <p className="text-[9px] uppercase font-black text-gray-300">Vendedor Asignado</p>
                        <p className="text-sm font-black text-cyan-700">{vendedorActual}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input type="text" name="nombre" placeholder="Nombre / Comercio" value={formData.nombre} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-medium" />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input type="text" name="telefono" placeholder="WhatsApp" value={formData.telefono} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-medium" />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input type="text" name="localidad" placeholder="Localidad" value={formData.localidad} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-medium" />
                        </div>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea name="comentarios" placeholder="Comentarios adicionales..." value={formData.comentarios} onChange={handleInputChange} rows="3" className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none bg-white resize-none font-medium"></textarea>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-cyan-50 p-8 rounded-3xl border border-cyan-100 text-center space-y-4">
                    <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <Lock className="text-cyan-500 w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-cyan-800 uppercase text-xs tracking-widest mb-1">Registro Necesario</h4>
                        <p className="text-xs text-cyan-600 font-medium">Debes iniciar sesión para poder enviarnos tu pedido.</p>
                    </div>
                    <button 
                        onClick={() => { setIsCartOpen(false); navigate('/login'); }}
                        className="w-full bg-cyan-500 text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-cyan-600 transition-all"
                    >
                        Ingresar / Registrarme
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isSent && cartItems.length > 0 && (
            <div className="p-8 border-t bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Total Estimado</span>
                  {/* 6. INDICADOR INTERFAZ S/IVA O C/IVA */}
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 border w-max ${
                    esPedidoConIva ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {esPedidoConIva ? 'IVA Incluido' : 'Valores Netos + IVA'}
                  </span>
                </div>
                <span className="text-3xl font-black text-cyan-600 tracking-tighter">${cartTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {user ? (
                <button 
                    onClick={enviarPedido}
                    disabled={isSending}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 text-white transition-all shadow-xl ${isSending ? 'bg-gray-300' : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-200'}`}
                >
                    {isSending ? 'Procesando...' : <><Send className="w-4 h-4" /> Enviar Pedido</>}
                </button>
              ) : (
                <button 
                    disabled
                    className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Lock size={16} /> Finalizar Pedido
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;