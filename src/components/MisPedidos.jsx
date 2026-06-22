import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/Config'; // Importamos auth y db de Firebase
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // Importes de Firestore
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

const MisPedidos = () => {
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [loading, setLoading] = useState(true); // Agregamos un estado de carga

  useEffect(() => {
    const obtenerPedidos = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // CONSULTA REAL A FIRESTORE: Buscamos en la colección "pedidos" donde el "uid" coincida
          const pedidosRef = collection(db, "pedidos");
          const q = query(
            pedidosRef, 
            where("uid", "==", user.uid),
            orderBy("fecha", "desc") // Los más nuevos primero
          );
          
          const querySnapshot = await getDocs(q);
          const listaPedidos = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convertimos la fecha de Firebase (Timestamp) a un texto legible en Argentina
            let fechaFormateada = "Sin fecha";
            if (data.fecha && data.fecha.toDate) {
              fechaFormateada = data.fecha.toDate().toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }

            listaPedidos.push({
              id: doc.id, // Usamos el ID real del documento de Firebase
              ...data,
              fecha: fechaFormateada
            });
          });

          setPedidosFiltrados(listaPedidos);
        } catch (error) {
          console.error("Error al traer el historial de pedidos:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    obtenerPedidos();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-xs mt-2 font-medium">Cargando tus pedidos...</p>
      </div>
    );
  }

  if (pedidosFiltrados.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
        <Package className="w-12 h-12 text-gray-200 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No tienes pedidos registrados en esta cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pedidosFiltrados.map((pedido) => (
        <div key={pedido.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
          
          <button 
            onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
             <div className="text-left">
                {/* Mostramos los últimos 6 dígitos del ID real de Firebase */}
                <p className="text-[10px] font-bold text-cyan-500 uppercase">Pedido #{pedido.id.slice(-6)}</p>
                <p className="text-sm font-bold text-gray-700">{pedido.fecha}</p>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  pedido.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {pedido.estado || 'pendiente'}
                </span>
             </div>
             <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-black text-gray-800">${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                  <p className="text-[9px] text-gray-400 font-medium">Preventista: {pedido.vendedor || 'Sin asignar'}</p>
                </div>
                {abierto === pedido.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
             </div>
          </button>

          {abierto === pedido.id && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm space-y-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Detalle de Productos</p>
               {pedido.productos && pedido.productos.map((prod, i) => (
                 <div key={i} className="flex justify-between items-center text-gray-600 font-medium py-1 border-b border-gray-100 last:border-0">
                    <span>{prod.name} <span className="text-cyan-600 font-bold">x{prod.quantity}</span></span>
                    <span className="font-bold text-gray-700">${(prod.price * prod.quantity).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                 </div>
               ))}
               {pedido.comentarios && (
                 <div className="mt-3 p-2 bg-white rounded-xl border border-gray-100 text-xs text-gray-500 italic">
                   <strong>Comentarios:</strong> {pedido.comentarios}
                 </div>
               )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MisPedidos;