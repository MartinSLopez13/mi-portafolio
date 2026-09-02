import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (isRegistering) {
        // --- PROCESO DE REGISTRO ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const cleanName = name.trim();
        const cleanPhone = phone.trim();

        const userData = {
          uid: user.uid,
          name: cleanName,
          email: user.email,
          phone: cleanPhone,
          createdAt: new Date().toISOString()
        };

        // Guardar teléfono y nombre en la colección "usuarios" (coincide con tu regla de Firestore)
        try {
          await setDoc(doc(db, "usuarios", user.uid), userData);
        } catch (firestoreErr) {
          console.warn("No se pudo guardar el perfil extra en Firestore:", firestoreErr);
          // La cuenta en Auth ya se creó exitosamente, no interrumpimos el flujo
        }

        onLogin({
          ...userData,
          isAdmin: false
        });

      } else {
        // --- PROCESO DE LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Buscar datos guardados en Firestore
        let extraData = {};
        try {
          // Buscamos primero en "usuarios" y fallback a "users" si tenés cuentas viejas
          let userDoc = await getDoc(doc(db, "usuarios", user.uid));
          if (!userDoc.exists()) {
            userDoc = await getDoc(doc(db, "users", user.uid));
          }

          if (userDoc.exists()) {
            extraData = userDoc.data();
          }
        } catch (docErr) {
          console.error("Error al obtener perfil de Firestore:", docErr);
        }

        const adminEmails = ['admin@santomate.com', 'juanpablo@santomate.com'];
        const isAdmin = adminEmails.includes(user.email.toLowerCase());

        onLogin({
          uid: user.uid,
          email: user.email,
          name: extraData.name || user.displayName || user.email.split('@')[0],
          phone: extraData.phone || '', 
          isAdmin: isAdmin,
        });
      }

      handleClose();
    } catch (err) {
      setLoading(false);
      console.error("Error en autenticación:", err.code || err);

      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error al autenticar. Intentalo de nuevo.');
      }
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
              {isRegistering ? 'Completá tus datos para registrarte' : 'Accedé a tu cuenta de SantoMate'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

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

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
          >
            {loading 
              ? 'Procesando...' 
              : isRegistering ? 'Crear mi cuenta' : 'Ingresar'}
          </button>

          {/* Switch para cambiar entre Login y Registro */}
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
        </form>

      </div>
    </div>
  );
};