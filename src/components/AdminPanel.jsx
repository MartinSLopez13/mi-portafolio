import React, { useState, useEffect } from 'react';
import { db, auth } from '../Firebase/Config'; 
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  updateDoc, query, orderBy, onSnapshot, getDoc 
} from 'firebase/firestore'; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'; 
import { 
  Trash2, Edit3, Save, Search, FileSpreadsheet, LogOut, Lock, Phone, MapPin, MessageSquare
} from 'lucide-react'; 
import * as XLSX from 'xlsx'; 

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pedidos');

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // MODIFICADO: Sumamos 'category' al estado del formulario de edición manual
  const [editForm, setEditForm] = useState({ name: '', precioConIva: '', precioSinIva: '', image: '', category: '' });

  const [orders, setOrders] = useState([]);
  const [excelPreview, setExcelPreview] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateMode, setUpdateMode] = useState('create');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
          if (userDoc.exists() && userDoc.data().rol === 'admin') {
            setUser(currentUser);
            const userDataParaApp = {
              uid: currentUser.uid,
              email: currentUser.email,
              rol: 'admin',
              nombre: userDoc.data().nombre || 'Administrador'
            };
            localStorage.setItem('usuarioBaires', JSON.stringify(userDataParaApp));
            fetchProducts();
            listenOrders();
          } else {
            alert("Acceso denegado: Tu cuenta no tiene permisos de administrador.");
            localStorage.removeItem('usuarioBaires');
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Error al verificar los permisos en Firestore:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    const data = await getDocs(collection(db, "productos"));
    setProducts(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const listenOrders = () => {
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
    } catch (error) { 
      alert("Acceso denegado. Verifique sus credenciales."); 
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('usuarioBaires');
    await signOut(auth);
    window.location.href = "/";
  };

  const parsePrecioExcel = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    let str = String(value).replace(/\s/g, '').replace(/\$/g, '').trim();
    
    if (str.includes(',') && str.includes('.')) {
      if (str.indexOf('.') < str.indexOf(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    }
    
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet);
      
      const cleanedData = rawData.map(item => {
        const keys = Object.keys(item);
        
        const keyConIva = keys.find(k => {
          const txt = k.trim().toUpperCase();
          return txt.includes("CON IVA") || txt.includes("CONIVA") || txt === "IVA" || txt.includes("FINAL");
        });
        
        const keySinIva = keys.find(k => {
          const txt = k.trim().toUpperCase();
          return txt.includes("SIN IVA") || txt.includes("SINIVA") || txt.includes("NETO") || txt.includes("+ IVA") || txt.includes("+IVA");
        });

        const keyPrecioGeneral = keys.find(k => k.trim().toUpperCase() === "PRECIO" || k.trim().toUpperCase() === "PRECIOS");
        const keyNombre = keys.find(k => k.trim().toUpperCase().includes("ARTICULO") || k.trim().toUpperCase().includes("NOMBRE") || k.trim().toUpperCase().includes("DESCRIPCION") || k.trim().toUpperCase() === "PRODUCTO");
        const keyCodigo = keys.find(k => k.trim().toUpperCase().includes("CODIGO") || k.trim().toUpperCase() === "COD");
        const keyImagen = keys.find(k => k.trim().toUpperCase().includes("IMAGEN") || k.trim().toUpperCase().includes("FOTO") || k.trim().toUpperCase().includes("URL"));
        
        // NUEVO: Mapeo inteligente de la columna categoría del Excel
        const keyCategoria = keys.find(k => {
          const txt = k.trim().toUpperCase();
          return txt.includes("CATEGORIA") || txt.includes("RUBRO") || txt.includes("TIPO");
        });

        let precioConIvaFinal = 0;
        let precioSinIvaFinal = 0;

        if (keyConIva) {
          precioConIvaFinal = parsePrecioExcel(item[keyConIva]);
        }
        if (keySinIva) {
          precioSinIvaFinal = parsePrecioExcel(item[keySinIva]);
        }

        if (keyPrecioGeneral && !keyConIva && !keySinIva) {
          const precioComun = parsePrecioExcel(item[keyPrecioGeneral]);
          precioConIvaFinal = precioComun;
          precioSinIvaFinal = precioComun;
        }

        return {
          codigo: String(item[keyCodigo] || '').trim(),
          name: item[keyNombre] || 'Sin Nombre',
          precioConIva: precioConIvaFinal,
          precioSinIva: precioSinIvaFinal,
          image: item[keyImagen] || '/assets/no-photo.jpg',
          // Si trae categoría la limpia y guarda, si no, por defecto va a 'General'
          category: keyCategoria && item[keyCategoria] ? String(item[keyCategoria]).trim() : 'General',
          destacado: false 
        };
      }).filter(item => item.codigo !== '');
      
      setExcelPreview(cleanedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const procesarExcel = async () => {
    setIsProcessing(true);
    let count = 0;
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const existentes = {};
      const productosActuales = {};
      
      querySnapshot.forEach(doc => { 
        if (doc.data().codigo) {
          existentes[doc.data().codigo] = doc.id;
          productosActuales[doc.data().codigo] = doc.data();
        }
      });

      for (const item of excelPreview) {
        if (existentes[item.codigo]) {
          const prodActual = productosActuales[item.codigo];
          const updateData = { 
            name: item.name,
            // Guardamos la categoría del excel en la actualización
            category: item.category 
          };
          
          updateData.precioConIva = item.precioConIva > 0 ? item.precioConIva : (prodActual.precioConIva || 0);
          updateData.precioSinIva = item.precioSinIva > 0 ? item.precioSinIva : (prodActual.precioSinIva || 0);

          if (item.image && item.image !== '/assets/no-photo.jpg') {
              updateData.image = item.image;
          }
          
          await updateDoc(doc(db, "productos", existentes[item.codigo]), updateData);
        } else if (updateMode === 'create') {
          await addDoc(collection(db, "productos"), item);
        }
        count++;
      }
      alert(`Sistema Bayres: ${count} productos procesados con éxito.`);
      setExcelPreview([]);
      fetchProducts();
    } catch (e) { 
      console.error(e);
      alert("Error en el procesamiento."); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-10 p-6 space-y-8 font-sans">
      {/* Navbar de Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-cyan-500 text-white p-4 rounded-3xl font-black text-2xl shadow-lg shadow-cyan-100">PB</div>
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border">
            <button onClick={() => setActiveTab('pedidos')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${activeTab === 'pedidos' ? 'bg-white shadow-md text-cyan-600' : 'text-gray-400'}`}>Pedidos ({orders.length})</button>
            <button onClick={() => setActiveTab('productos')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${activeTab === 'productos' ? 'bg-white shadow-md text-cyan-600' : 'text-gray-400'}`}>Productos</button>
          </div>
        </div>
        <button onClick={handleLogout} className="text-red-400 font-black uppercase text-[10px] flex items-center gap-2 p-4 rounded-2xl hover:bg-red-50 transition-all"><LogOut size={16}/> Cerrar Sesión</button>
      </div>

      {activeTab === 'productos' && (
        <div className="space-y-8">
          {/* Carga Excel */}
          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center gap-6 text-center shadow-sm">
            <FileSpreadsheet className="text-cyan-500 w-12 h-12" />
            <h3 className="font-black text-gray-800 uppercase text-sm tracking-widest">Carga Masiva de Productos</h3>
            <p className="text-xs text-gray-400 max-w-md -mt-4">El Excel puede contener la columna <b className="text-gray-600">CATEGORIA</b> (o RUBRO) para organizar los filtros automáticamente.</p>
            <div className="flex gap-3">
              <button onClick={() => setUpdateMode('create')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${updateMode === 'create' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white text-gray-400 border'}`}>Importar Todo</button>
              <button onClick={() => setUpdateMode('updateOnly')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${updateMode === 'updateOnly' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 border'}`}>Solo Precios</button>
            </div>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileSelect} className="text-[10px] bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200" />
            {excelPreview.length > 0 && (
              <button onClick={procesarExcel} disabled={isProcessing} className="w-full max-w-md bg-green-500 text-white py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl hover:bg-green-600 transition-all">
                {isProcessing ? "Procesando..." : `Confirmar y Subir ${excelPreview.length} Productos`}
              </button>
            )}
          </section>

          {/* Tabla de Productos */}
          <section className="bg-white shadow-xl rounded-[3rem] overflow-hidden border border-gray-100">
             <div className="p-8 bg-gray-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-6">
                <h2 className="font-black text-gray-400 uppercase text-xs tracking-widest">Inventario Bayres</h2>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 border-none bg-white rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                    <tr>
                      <th className="p-6">Foto</th>
                      <th className="p-6">Código</th>
                      <th className="p-6">Producto / Categoría</th> {/* CAMBIADO EL ENCABEZADO */}
                      <th className="p-6">Precio más IVA</th>
                      <th className="p-6">Precio Final</th>
                      <th className="p-6 text-center">Inicio</th>
                      <th className="p-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .sort((a, b) => String(a.codigo).localeCompare(String(b.codigo), undefined, { numeric: true, sensitivity: 'base' }))
                      .map(item => (
                        <tr key={item.id} className="hover:bg-cyan-50/20 transition-colors">
                          <td className="p-6">
                            <div className="flex flex-col gap-2">
                              <img src={editingId === item.id ? editForm.image : (item.image || '/assets/no-photo.jpg')} className="w-14 h-14 rounded-2xl object-cover border-2 border-white bg-gray-50 shadow-sm" alt=""/>
                              {editingId === item.id && (
                                <input value={editForm.image} onChange={(e) => setEditForm({...editForm, image: e.target.value})} className="border border-cyan-500 p-2 text-[9px] w-28 rounded-lg bg-white" placeholder="URL Foto" />
                              )}
                            </div>
                          </td>
                          <td className="p-6 font-mono text-[11px] text-gray-400 font-bold">{item.codigo}</td>
                          
                          {/* COLUMNA PRODUCTO: Ahora incluye la categoría abajo del nombre o el input para cambiarla */}
                          <td className="p-6">
                            {editingId === item.id ? (
                              <div className="space-y-2">
                                <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="border-2 border-cyan-500 p-2 rounded-xl w-full font-bold text-xs" placeholder="Nombre del artículo" />
                                <input value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="border border-cyan-400 p-2 rounded-xl w-full text-[11px] font-medium bg-gray-50" placeholder="Categoría (Ej: RESMAS)" />
                              </div>
                            ) : (
                              <div>
                                <p className="font-bold text-gray-800 leading-tight text-sm">{item.name}</p>
                                <span className="text-[9px] bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-md font-black uppercase tracking-wider mt-1.5 inline-block border border-cyan-100">
                                  {item.category || 'General'}
                                </span>
                              </div>
                            )}
                          </td>
                          
                          <td className="p-6 font-black text-amber-600 text-base">
                            {editingId === item.id ? (
                              <input type="number" value={editForm.precioSinIva} onChange={(e) => setEditForm({...editForm, precioSinIva: e.target.value})} className="border-2 border-cyan-500 p-2 rounded-xl w-24" />
                            ) : (
                              <span>${Number(item.precioSinIva || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            )}
                          </td>

                          <td className="p-6 font-black text-cyan-600 text-base">
                            {editingId === item.id ? (
                              <input type="number" value={editForm.precioConIva} onChange={(e) => setEditForm({...editForm, precioConIva: e.target.value})} className="border-2 border-cyan-500 p-2 rounded-xl w-24" />
                            ) : (
                              <span>${Number(item.precioConIva || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            )}
                          </td>

                          <td className="p-6 text-center">
                            <button
                              onClick={async () => {
                                const nuevoEstadoDestacado = !item.destacado;
                                await updateDoc(doc(db, "productos", item.id), {
                                  destacado: nuevoEstadoDestacado
                                });
                                fetchProducts(); 
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                item.destacado 
                                  ? 'bg-cyan-500 text-white border-cyan-600 shadow-md shadow-cyan-100' 
                                  : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {item.destacado ? '⭐ En Oferta' : 'Destacar'}
                            </button>
                          </td>

                          <td className="p-6 text-center">
                            <div className="flex justify-center gap-3">
                               {editingId === item.id ? (
                                 <button 
                                   onClick={async () => { 
                                     await updateDoc(doc(db, "productos", item.id), { 
                                       name: editForm.name, 
                                       precioConIva: Number(editForm.precioConIva), 
                                       precioSinIva: Number(editForm.precioSinIva), 
                                       image: editForm.image,
                                       category: editForm.category || 'General' // Guardado de la edición manual
                                     }); 
                                     setEditingId(null); 
                                     fetchProducts(); 
                                   }} 
                                   className="p-3 bg-green-500 text-white rounded-xl shadow-lg"
                                 >
                                   <Save size={18}/>
                                 </button>
                               ) : (
                                 <>
                                   <button 
                                     onClick={() => { 
                                       setEditingId(item.id); 
                                       setEditForm({ 
                                         name: item.name, 
                                         precioConIva: item.precioConIva || '', 
                                         precioSinIva: item.precioSinIva || '', 
                                         image: item.image || '',
                                         category: item.category || 'General' // Carga inicial para el input de edición
                                       }); 
                                     }} 
                                     className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                   >
                                     <Edit3 size={18}/>
                                   </button>
                                   <button onClick={() => { if(window.confirm("¿Borrar producto?")) deleteDoc(doc(db, "productos", item.id)).then(fetchProducts) }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                 </>
                               )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
               </table>
             </div>
          </section>
        </div>
      )}
      
      {/* Pestaña Pedidos Completa */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black bg-white px-4 py-2 rounded-full border shadow-sm uppercase text-cyan-600 font-mono tracking-widest">PEDIDO #{order.id.slice(-5)}</span>
                    <span className="text-xs font-bold text-gray-400">{order.fecha?.toDate().toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => updateDoc(doc(db, "pedidos", order.id), {estado: 'en camino'})} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm ${order.estado === 'en camino' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500 border border-orange-100'}`}>En Camino</button>
                    <button onClick={() => updateDoc(doc(db, "pedidos", order.id), {estado: 'entregado'})} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm ${order.estado === 'entregado' ? 'bg-green-500 text-white' : 'bg-white text-green-500 border border-green-100'}`}>Entregado</button>
                    <button onClick={() => {if(window.confirm("¿Borrar pedido?")) deleteDoc(doc(db, "pedidos", order.id))}} className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
                <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="space-y-6 border-r border-gray-100 pr-6">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Cliente</h4>
                    <p className="text-xl font-black text-gray-800 tracking-tight">{order.clienteNombre}</p>
                    <div className="space-y-3 text-sm text-gray-600 font-medium">
                        <p className="flex items-center gap-3"><Phone size={16} className="text-cyan-500"/> {order.clienteTelefono}</p>
                        <p className="flex items-center gap-3"><MapPin size={16} className="text-cyan-500"/> {order.clienteDireccion}</p>
                    </div>
                    {order.comentarios && (
                      <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-[1.5rem] mt-6">
                        <p className="text-[10px] font-black uppercase text-yellow-600 mb-2 flex items-center gap-2"><MessageSquare size={12}/> Nota del Cliente:</p>
                        <p className="text-sm text-yellow-800 font-medium italic">"{order.comentarios}"</p>
                      </div>
                    )}
                    <div className="space-y-2 pt-4">
                      <span className="px-5 py-2 bg-cyan-50 text-cyan-700 rounded-xl text-[11px] font-black uppercase block w-max">Vendedor: {order.vendedor}</span>
                      {order.esPedidoConIva !== undefined && (
                        <span className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase block w-max ${
                          order.esPedidoConIva ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {order.esPedidoConIva ? 'Lista: Con IVA' : 'Lista: Neto + IVA'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="lg:col-span-2 bg-gray-50/30 rounded-[2rem] p-8 border border-gray-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase mb-6 tracking-widest">Detalle</h4>
                    <div className="space-y-3">
                        {order.productos?.map((p, i) => (
                          <div key={i} className="flex justify-between text-sm bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                            <span className="text-gray-700"><b className="text-cyan-600 font-black mr-2 tracking-tighter">x{p.quantity}</b> {p.name}</span>
                            <span className="font-black text-gray-900">${((p.price || p.precioCongelado) * p.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                    </div>
                    <div className="flex justify-between pt-8 text-2xl font-black text-cyan-600 mt-6 border-t border-gray-100 uppercase tracking-tighter"><span>Total</span><span>${order.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;