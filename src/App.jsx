import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CartProvider } from './context/CartContext';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './Firebase/Config';

import Header from './components/Header'; 
import Hero from './components/Hero'; 
import ProductsGrid from './components/ProductsGrid'; 
import CartSidebar from './components/CartSidebar'; 
import Login from './pages/Login';
import AdminPanel from './components/AdminPanel';
import Profile from './pages/Profile';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-white relative">
      <Header onSearch={(query) => setSearchQuery(query)} /> 
      <CartSidebar /> 
      
      <main>
        {!searchQuery && <Hero />}
        <div id="products-grid" style={{ scrollMarginTop: '100px' }}>
          <ProductsGrid searchQuery={searchQuery} />
        </div>
      </main>

      <footer className="p-10 bg-gray-900 text-white text-center mt-20">
        <p>&copy; 2026 Papelera Baires - Distribuidora IBAI BAYRES</p>
      </footer>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escuchamos el estado real de Firebase Auth y Firestore de manera global
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Traemos el rol real guardado en Firestore para proteger las rutas
          const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().rol);
          } else {
            setRole('cliente');
          }
        } catch (error) {
          console.error("Error al traer el rol:", error);
          setRole('cliente');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-600 font-black uppercase text-[10px] tracking-widest">Cargando Papelera Baires...</p>
      </div>
    );
  }

  const isAuth = !!user;

  return (
    <CartProvider>
      <Router>
        <Helmet>
          <title>Papelera Baires | Insumos de Papelería</title>
        </Helmet>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route 
            path="/login" 
            element={isAuth ? <Navigate to="/" /> : <Login />} 
          />

          {/* Ruta Protegida del Admin: Exige inicio de sesión y rol 'admin' en Firestore */}
          <Route 
            path="/admin" 
            element={isAuth && role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} 
          />

          {/* Ruta Protegida para el Perfil del Cliente */}
          <Route 
            path="/perfil" 
            element={isAuth ? (
              <div className="min-h-screen bg-gray-50">
                <Header onSearch={() => {}} />
                <Profile />
              </div>
            ) : (
              <Navigate to="/login" />
            )} 
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;