import React from 'react';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase/config'; 
import { Plus, Lock } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; 

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const user = auth.currentUser; 

  // 1. LEER PREFERENCIA DE IVA DESDE LOCALSTORAGE
  const usuarioGuardado = localStorage.getItem('usuarioBaires');
  const usuarioData = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  
  // Si por alguna razón no se guardó el campo en el perfil, por defecto usamos true (Con IVA)
  const mostrarConIva = usuarioData && usuarioData.verConIva !== undefined ? usuarioData.verConIva : true;

  // 2. SELECCIONAR EL PRECIO CORRECTO SEGÚN LA CONFIGURACIÓN DEL USUARIO
  // Usamos los nombres de los nuevos campos que vas a subir en tu lista/DB
  const price = user 
    ? (mostrarConIva ? (Number(product.precioConIva) || 0) : (Number(product.precioSinIva) || 0))
    : 0;

  const handleAction = () => {
    if (!user) {
      alert("¡Hola! Para sumar productos al carrito y realizar pedidos en Distribuidora Baires, primero tenés que iniciar sesión o registrarte.");
      navigate('/login'); 
      return;
    }
    
    // Pasamos el producto al carrito inyectándole cómo se calculó el precio
    // para que la pantalla del carrito sepa qué renderizar y sumar
    addToCart({ 
      ...product, 
      precioCongelado: price, 
      verConIvaEnPedido: mostrarConIva 
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-cyan-100 transition-all duration-300 group flex flex-col h-full">
      
      {/* Contenedor de Imagen */}
      <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center relative">
        <img 
          src={product.image && !product.image.includes('placeholder') 
            ? product.image 
            : "/assets/no-photo.jpg"} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = "/assets/no-photo.jpg"; 
          }}
        />
        
        {/* Badge de Categoría */}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-500 px-2 py-1 rounded-full uppercase tracking-wider">
            {product.category}
          </span>
        )}
      </div>

      {/* Información del Producto */}
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest mb-1">
          {product.codigo ? `Cód: ${product.codigo}` : 'S/N'}
        </span>

        <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem] leading-tight">
          {product.name}
        </h3>
        
        <div className="mt-auto flex justify-between items-center pt-4">
          
          {/* Muestra precio u ocultarlo con candado */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Precio</span>
            {user ? (
              <div className="flex items-center gap-1.5">
                <p className="text-2xl font-black text-cyan-600">
                  ${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {/* 3. BADGE INDICADOR DE ESTADO DE IVA */}
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                  mostrarConIva ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {mostrarConIva ? 'Con IVA' : '+ IVA'}
                </span>
              </div>
            ) : (
              <div 
                onClick={() => navigate('/login')} 
                className="flex items-center gap-1 text-gray-400 font-bold text-sm mt-1 cursor-pointer hover:text-cyan-500 transition-colors"
                title="Iniciá sesión para ver los precios"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Iniciá sesión</span>
              </div>
            )}
          </div>

          {/* Botón de Agregar con validación */}
          <button 
            onClick={handleAction}
            className={`flex items-center justify-center w-12 h-12 rounded-xl active:scale-95 transition-all shadow-lg duration-500 ${
              user 
              ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-cyan-100 group-hover:rotate-[360deg]' 
              : 'bg-gray-200 text-gray-400 shadow-none'
            }`}
            title={user ? "Agregar al carrito" : "Iniciá sesión para comprar"}
          >
            {user ? <Plus className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;