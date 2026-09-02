import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/client';
import { VENDEDORES } from '../data/vendedores';

const Login = ({ onLoginSuccess }) => {
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
    verConIva: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'verConIva') {
      setFormData((prev) => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN VÍA API MYSQL ---
        const authData = await loginUser(formData.email, formData.password);

        if (onLoginSuccess) {
          onLoginSuccess(authData.user);
        }

        alert("¡Bienvenido de nuevo!");
      } else {
        // --- REGISTRO VÍA API MYSQL ---
        const codigoIngresado = formData.vendedorCodigo
          ? formData.vendedorCodigo.trim().toUpperCase()
          : '';

        if (!VENDEDORES || !Array.isArray(VENDEDORES)) {
          alert("Hubo un problema al cargar la lista de vendedores.");
          setLoading(false);
          return;
        }

        const vendedorAsignado = VENDEDORES.find((v) => v.codigo === codigoIngresado);

        if (!vendedorAsignado) {
          alert("El código de vendedor no es válido. Solicitale el código correcto a tu preventista.");
          setLoading(false);
          return;
        }

        const authData = await registerUser(
          formData.nombre,
          formData.email,
          formData.password,
          formData.telefono
        );

        if (onLoginSuccess) {
          onLoginSuccess(authData.user);
        }

        alert(`¡Cuenta creada! Vendedor asignado: ${vendedorAsignado.nombre}`);
      }

      navigate('/');
    } catch (error) {
      console.error("Error en autenticación:", error);
      alert(error.message || "Error al procesar la solicitud.");
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
              <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">
                Nombre / Comercio
              </label>
              <input
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                placeholder="Ej: Kiosco 'El Sol'"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">
                  WhatsApp
                </label>
                <input
                  name="telefono"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                  placeholder="11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">
                  Dirección de Entrega
                </label>
                <input
                  name="direccion"
                  required
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                  placeholder="Calle Falsa 123"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">
                  Condición frente al IVA
                </label>
                <select
                  name="verConIva"
                  value={String(formData.verConIva)}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-gray-700 font-medium text-sm transition-all"
                >
                  <option value="true">Consumidor Final / Monotributo (Precios con IVA)</option>
                  <option value="false">Responsable Inscripto (Precios netos + IVA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-cyan-600 uppercase mb-1 ml-1 tracking-widest">
                  Código de Vendedor
                </label>
                <input
                  name="vendedorCodigo"
                  required
                  value={formData.vendedorCodigo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cyan-100 bg-cyan-50/30 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none uppercase font-bold text-cyan-700 text-sm"
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
            ) : isLogin ? (
              'Ingresar'
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <button
            type="button"
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