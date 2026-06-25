import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, User, Menu, LogOut, Settings, Search, 
  MapPin, Clock, Phone, ChevronDown, X,
  GraduationCap, Briefcase, Gift, Scissors, BookOpen, Monitor, Calendar, Percent, Package
} from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { auth, db } from '../Firebase/Config'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-md transition-all ${className}`}>
    {children}
  </button>
);

const CATEGORIAS_MENU = [
  { nombre: 'Escolar', icono: GraduationCap },
  { nombre: 'Comercial', icono: Briefcase },
  { nombre: 'Regalería', icono: Gift },
  { nombre: 'Artística', icono: Scissors },
  { nombre: 'Resmas', icono: BookOpen },
  { nombre: 'Tecnología', icono: Monitor },
  { nombre: 'Agendas', icono: Calendar },
  { nombre: 'Ofertas', icono: Percent },
  { nombre: 'Embalaje', icono: Package },
];

const Header = ({ onSearch, onCategoryChange, currentCategory, searchTermValue }) => { 
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODAS');
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  // Sincronizar el estado de la categoría local si cambia desde el HomePage
  useEffect(() => {
    if (currentCategory) {
      setCategoriaSeleccionada(currentCategory.toUpperCase());
    }
  }, [currentCategory]);

  // Sincronizar el input de texto local si se resetea desde el HomePage
  useEffect(() => {
    if (searchTermValue === '') {
      setSearchTerm('');
    }
  }, [searchTermValue]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "usuarios", currentUser.uid);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            const datosUsuario = userDoc.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              nombre: datosUsuario.nombre || 'Usuario'
            });
            setIsAdmin(datosUsuario.rol === 'admin');
          }
        } catch (error) {
          console.error("Error al leer Firestore:", error);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth); 
      localStorage.removeItem('usuarioBaires');
      setUser(null);
      setIsAdmin(false);
      navigate('/', { replace: true });
      window.location.reload(); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);

    if (value.length > 0) {
      document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategorySelect = (nombreCategoria) => {
    setCategoriaSeleccionada(nombreCategoria);
    setDropdownAbierto(false);
    
    if (onCategoryChange) {
      onCategoryChange(nombreCategoria === 'TODAS' ? 'Todas' : nombreCategoria); 
    }
    
    setTimeout(() => {
      document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 font-sans">
      
      {/* 📍 1. TOP BAR SUPERIOR */}
      <div className="w-full bg-cyan-950 text-cyan-200/80 text-[11px] font-medium border-b border-cyan-900/50 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.open('https://maps.google.com', '_blank')}>
            <MapPin size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hover:text-white transition-colors">Echenagucía 602, Ituzaingó</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-cyan-400" />
              <span>Lun a Vie 8:00 a 17:00 hs</span>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.open('https://wa.me/541112345678', '_blank')}>
              <Phone size={13} className="text-cyan-400 group-hover:animate-pulse" />
              <span className="hover:text-white transition-colors font-bold text-white">WhatsApp: 011 15-6203-4254</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 2. NAVBAR CENTRAL: LOGO, BUSCADOR Y LOGIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform shadow-lg shadow-cyan-100">
              PB
            </div>
            <div className="flex flex-col">
              <span className="font-black text-gray-800 tracking-tighter text-lg leading-none">
                PAPELERA <span className="text-cyan-500">BAYRES</span>
              </span>
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mt-0.5">
                Distribuidora
              </span>
            </div>
          </Link>

          {/* 🔍 SECCIÓN DEL MEDIO: BUSCADOR CON CATEGORÍAS INTEGRADAS */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-3">
            <div className="relative flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-xl pr-3 focus-within:bg-white focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all">
              <div className="relative flex-1 flex items-center">
                <input 
                  type="text" 
                  placeholder="¿Qué estás buscando hoy?" 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-8 py-2.5 bg-transparent outline-none text-xs font-bold text-gray-700"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                {searchTerm && (
                  <button onClick={() => { setSearchTerm(''); if(onSearch) onSearch(''); }} className="absolute right-2 text-gray-400 hover:text-red-500">
                    <X size={14}/>
                  </button>
                )}
              </div>

              {/* Separador vertical */}
              <div className="h-5 w-[1px] bg-gray-300 mx-2"></div>

              {/* Dropdown de Categorías */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  className="flex items-center gap-1 text-[10px] font-black text-cyan-950 uppercase tracking-wider hover:text-cyan-600 transition-colors whitespace-nowrap focus:outline-none"
                >
                  <span>{categoriaSeleccionada}</span>
                  <ChevronDown size={14} className={`text-cyan-500 transition-transform ${dropdownAbierto ? 'rotate-180' : ''}`} />
                </button>

                {dropdownAbierto && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 max-h-60 overflow-y-auto">
                    <button 
                      type="button"
                      onClick={() => handleCategorySelect('TODAS')}
                      className={`w-full text-left px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${categoriaSeleccionada === 'TODAS' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      TODAS
                    </button>
                    {CATEGORIAS_MENU.map((cat, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => handleCategorySelect(cat.nombre)}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${categoriaSeleccionada === cat.nombre.toUpperCase() ? 'bg-cyan-50 text-cyan-600' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACCIONES DERECHA */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-xl hover:bg-cyan-600 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg">
                <Settings size={14} />
                <span className="hidden lg:inline">Panel</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                <Link to="/perfil" className="flex flex-col items-end group">
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter group-hover:text-cyan-500 transition-colors leading-none mb-1">Mi Perfil</span>
                  <span className="text-sm font-bold text-gray-700 leading-none group-hover:text-cyan-600 transition-colors">
                    {user.nombre ? user.nombre.split(' ')[0] : 'Usuario'}
                  </span>
                </Link>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 font-bold text-sm">
                  <User size={20} />
                  <span className="hidden sm:inline">Ingresar</span>
                </Button>
              </Link>
            )}

            {/* CARRITO */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-gray-50 hover:bg-cyan-50 rounded-full transition-all group">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-cyan-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full ring-4 ring-white shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 🔥 3. BOTONERA DE CATEGORÍAS CON ICONOS */}
      <div className="w-full border-t border-gray-100 bg-gray-50/50 py-3 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 lg:gap-12 overflow-x-auto scrollbar-none">
          {CATEGORIAS_MENU.map((cat, index) => {
            const IconoComponente = cat.icono;
            const estaActiva = categoriaSeleccionada === cat.nombre.toUpperCase();
            return (
              <button
                type="button"
                key={index}
                onClick={() => handleCategorySelect(cat.nombre)}
                className="flex flex-col items-center gap-1.5 group text-center focus:outline-none shrink-0"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-200 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-600 group-hover:-translate-y-0.5 ${estaActiva ? 'bg-cyan-500 text-white border-cyan-600' : 'bg-white text-gray-500 border-gray-200'}`}>
                  <IconoComponente size={18} strokeWidth={2.2} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-200 group-hover:text-cyan-600 ${estaActiva ? 'text-cyan-600' : 'text-gray-400'}`}>
                  {cat.nombre}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </header>
  );
};

export default Header;