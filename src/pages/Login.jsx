import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/Config'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
// IMPORTAMOS LOS VENDEDORES CENTRALIZADOS
import { VENDEDORES } from '../data/vendedores'; 

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    direccion: '',
    telefono: '',
    password: '',
    vendedorCodigo: '',
    verConIva: true // 1. Setemos "true" por defecto (Consumidor Final)
  });

  const handleChange = (e) => {
    // Si cambia el select de IVA, convertimos el string a booleano real
    if (e.target.name === 'verConIva') {
      setFormData({ ...formData, [e.target.name]: e.target.value === 'true' });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LÓGICA DE LOGIN ---
        const res = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const userDoc = await getDoc(doc(db, "usuarios", res.user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          localStorage.setItem('usuarioBaires', JSON.stringify({
            uid: res.user.uid,
            nombre: data.nombre,
            email: data.email,
            direccion: data.direccion,
            telefono: data.telefono,
            vendedorNombre: data.vendedor || 'Sin Vendedor',
            vendedor: data.vendedorCodigo || '1', 
            rol: data.rol || 'cliente',
            verConIva: data.verConIva !== undefined ? data.verConIva : true // 2a. Recuperamos el dato guardado
          }));
        }
        alert("¡Bienvenido de nuevo!");
      } else {
        // --- LÓGICA DE REGISTRO ---
        const codigoIngresado = formData.vendedorCodigo ? formData.vendedorCodigo.trim().toUpperCase() : '';
        
        if (!VENDEDORES || !Array.isArray(VENDEDORES)) {
          console.error("Error: VENDEDORES no se importó como un Array. Revisá data/vendedores.js");
          alert("Hubo un problema interno al cargar la lista de vendedores. Por favor, avisanos.");
          setLoading(false);
          return;
        }

        const vendedorAsignado = VENDEDORES.find(v => v.codigo === codigoIngresado);

        if (!vendedorAsignado) {
          alert("El código de vendedor no es válido. Por favor, pedile el código correcto a tu vendedor.");
          setLoading(false);
          return;
        }

        const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        const nuevoUsuario = {
          nombre: formData.nombre,
          email: formData.email,
          direccion: formData.direccion,
          telefono: formData.telefono,
          vendedor: vendedorAsignado.nombre,      
          vendedorEmail: vendedorAsignado.email,   
          vendedorCodigo: codigoIngresado,         
          rol: 'cliente',
          verConIva: formData.verConIva // 2b. Lo mandamos a la base de datos de Firestore
        };

        await setDoc(doc(db, "usuarios", res.user.uid), nuevoUsuario);

        localStorage.setItem('usuarioBaires', JSON.stringify({
          uid: res.user.uid,
          ...nuevoUsuario,
          vendedorNombre: vendedorAsignado.nombre,
          vendedor: codigoIngresado 
        }));

        alert(`¡Cuenta creada! Vendedor asignado: ${vendedorAsignado.nombre}`);
      }

      navigate('/');
      window.location.reload(); 

    } catch (error) {
      console.error("Error en el catch de Login:", error);
      alert("Error: " + (isLogin ? "Credenciales incorrectas" : "El mail ya existe o los datos son inválidos"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-all">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-2xl text-white font-bold text-2xl mb-4 shadow-lg shadow-cyan-100">
            PB
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? '¡Hola de nuevo!' : 'Registro de Cliente'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin ? 'Ingresá para continuar con tu pedido' : 'Ingresá tus datos para agilizar tus pedidos'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Nombre / Comercio</label>
              <input name="nombre" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="Ej: Kiosco 'El Sol'" />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Email</label>
            <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="correo@ejemplo.com" />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Contraseña</label>
            <input name="password" type="password" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="••••••••" />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">WhatsApp</label>
                <input name="telefono" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="11 1234-5678" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Dirección de Entrega</label>
                <input name="direccion" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all" placeholder="Calle Falsa 123, Marcos Paz" />
              </div>

              {/* 3. SELECTOR DE CONDICIÓN DE IVA */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Condición frente al IVA</label>
                <select 
                  name="verConIva" 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-gray-700 font-medium text-sm transition-all"
                >
                  <option value="true">Consumidor Final / Monotributo (Precios con IVA)</option>
                  <option value="false">Responsable Inscripto (Precios netos + IVA)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black text-cyan-600 uppercase mb-1 ml-1 tracking-widest">Código de Vendedor</label>
                <input 
                  name="vendedorCodigo" 
                  required 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-cyan-100 bg-cyan-50/30 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none uppercase font-bold text-cyan-700" 
                  placeholder="Ej: M123" 
                />
                <p className="text-[10px] text-gray-400 mt-2 ml-1 italic leading-tight">
                  * Obligatorio para vincularte con tu preventista.
                </p>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-100 mt-6 uppercase tracking-widest text-sm flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (isLogin ? 'Ingresar' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-cyan-600 font-bold text-sm hover:text-cyan-700 transition-colors"
          >
            {isLogin ? '¿No tenés cuenta? Registrate acá' : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;