import React, { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/client';

const GOOGLE_CLIENT_ID = "1013336470310-gvqul73hlc33trlej5idko0hv5qqvmc2.apps.googleusercontent.com";

export const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Decodificador del JWT devuelto por Google
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Callback al seleccionar cuenta de Google
  const handleGoogleCredentialResponse = async (response) => {
    try {
      setError('');
      setLoading(true);
      const decoded = parseJwt(response.credential);

      if (!decoded) {
        throw new Error('No se pudieron obtener los datos de la cuenta de Google.');
      }

      const googleUser = {
        name: decoded.name,
        email: decoded.email,
        photo: decoded.picture,
        googleId: decoded.sub
      };

      // Guardado local de persistencia
      localStorage.setItem('user', JSON.stringify(googleUser));

      if (onLogin) {
        onLogin(googleUser);
      }

      handleClose();
    } catch (err) {
      console.error('Error con Google Login:', err);
      setError('Error al iniciar sesión con Google. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Inicialización del botón de Google
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        const container = document.getElementById('googleSignInBtnContainer');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: isRegistering ? 'signup_with' : 'signin_with',
            shape: 'pill'
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isRegistering]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegistering) {
        data = await registerUser(name.trim(), email.trim(), password, phone.trim());
      } else {
        data = await loginUser(email.trim(), password);
      }

      if (data?.user) {
        onLogin(data.user);
      }

      handleClose();
    } catch (err) {
      setLoading(false);
      console.error("Error en autenticación:", err);
      setError(err.message || 'Ocurrió un error al autenticar. Intentalo de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="bg-emerald-950 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black tracking-wide">
              {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h3>
            <p className="text-xs text-emerald-300">
              {isRegistering ? 'Completá tus datos para registrarte' : 'Accedé a tu cuenta de El SantoMate MP'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="text-stone-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Botón oficial de Google */}
          <div className="w-full flex justify-center min-h-[44px]">
            <div id="googleSignInBtnContainer" className="w-full flex justify-center"></div>
          </div>

          {/* Separador */}
          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-stone-200"></div>
            <span className="px-3 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
              o con email
            </span>
            <div className="flex-1 border-t border-stone-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre (Solo en Registro) */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-700"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-700"
              />
            </div>

            {/* Teléfono (Solo en Registro) */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono / WhatsApp</label>
                <input 
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 11 1234 5678"
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-700"
                />
              </div>
            )}

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Contraseña</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-700"
              />
            </div>

            {/* Botón Principal Tradicional */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
            >
              {loading 
                ? 'Procesando...' 
                : isRegistering ? 'Crear mi cuenta' : 'Ingresar'}
            </button>
          </form>

          {/* Switch Registro / Login */}
          <div className="text-center pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs text-emerald-800 font-semibold hover:underline"
            >
              {isRegistering 
                ? '¿Ya tenés cuenta? Iniciá sesión acá' 
                : '¿No tenés cuenta? Registrate gratis'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};