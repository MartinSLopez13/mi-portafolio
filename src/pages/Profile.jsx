import React, { useState, useEffect } from 'react';
import { db, auth } from '../Firebase/Config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { User, MapPin, Phone, Mail, Save, Loader2, CheckCircle, Package } from 'lucide-react';
import MisPedidos from '../components/MisPedidos'; // <--- Importamos el componente de historial

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data(), uid: user.uid });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const userRef = doc(db, "usuarios", userData.uid);
      await updateDoc(userRef, {
        nombre: userData.nombre,
        direccion: userData.direccion,
        telefono: userData.telefono
      });
      
      const savedUser = JSON.parse(localStorage.getItem('usuarioBaires'));
      localStorage.setItem('usuarioBaires', JSON.stringify({
        ...savedUser,
        nombre: userData.nombre
      }));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto my-10 px-4 space-y-8"> {/* Añadido space-y-8 para separar las tarjetas */}
      
      {/* TARJETA 1: DATOS PERSONALES */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-cyan-500 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-bold italic">Mis Datos de Entrega</h2>
          <p className="text-cyan-100 text-sm opacity-80">Mantené tu información actualizada para tus pedidos</p>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-2 ml-1">
                <User size={14} /> Nombre del Comercio / Cliente
              </label>
              <input 
                type="text"
                value={userData?.nombre || ''}
                onChange={(e) => setUserData({...userData, nombre: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-2 ml-1">
                <Mail size={14} /> Email de la cuenta
              </label>
              <input 
                type="email"
                value={userData?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-2 ml-1">
                <Phone size={14} /> WhatsApp de Contacto
              </label>
              <input 
                type="text"
                value={userData?.telefono || ''}
                onChange={(e) => setUserData({...userData, telefono: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-2 ml-1">
                <MapPin size={14} /> Dirección de Entrega
              </label>
              <input 
                type="text"
                value={userData?.direccion || ''}
                onChange={(e) => setUserData({...userData, direccion: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={updating}
            className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
              success ? 'bg-green-500' : 'bg-cyan-500 hover:bg-cyan-600'
            } text-white`}
          >
            {updating ? <Loader2 className="animate-spin" size={20}/> : success ? <CheckCircle size={20}/> : <Save size={20}/>}
            {updating ? 'Guardando...' : success ? '¡Datos Actualizados!' : 'Guardar Cambios'}
          </button>
        </form>
      </div>

      {/* TARJETA 2: HISTORIAL DE PEDIDOS */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
            <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                <Package size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800">Historial de Pedidos</h3>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Tus compras en Papelera Baires</p>
            </div>
        </div>
        
        {/* Renderizamos el componente que lee del localStorage */}
        <MisPedidos />
      </div>

    </div>
  );
};

export default Profile;