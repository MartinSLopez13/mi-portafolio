// src/api/client.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función auxiliar para adjuntar el token JWT en las peticiones que lo requieran
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// --- PRODUCTOS ---
export const getProducts = async () => {
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
};

export const createProduct = async (productData) => {
  const res = await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Error al crear producto');
  return res.json();
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(productData)
  });
  if (!res.ok) throw new Error('Error al actualizar producto');
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar producto');
  return res.json();
};

// NUEVA: Actualizar el orden de los productos en lote
export const updateProductsOrder = async (orderedIds) => {
  const res = await fetch(`${API_URL}/productos/reordenar`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ orderedIds })
  });
  if (!res.ok) throw new Error('Error al actualizar el orden de productos');
  return res.json();
};

// --- PEDIDOS ---
export const getOrders = async () => {
  const res = await fetch(`${API_URL}/pedidos`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al cargar pedidos');
  return res.json();
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Error al crear pedido');
  return res.json();
};

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${API_URL}/pedidos/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Error al actualizar pedido');
  return res.json();
};

export const deleteOrder = async (id) => {
  const res = await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar pedido');
  return res.json();
};

// --- BANNERS ---
export const getBanners = async () => {
  const res = await fetch(`${API_URL}/banners`);
  if (!res.ok) throw new Error('Error al cargar banners');
  return res.json();
};

export const createBanner = async (bannerData) => {
  const res = await fetch(`${API_URL}/banners`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(bannerData)
  });
  if (!res.ok) throw new Error('Error al crear banner');
  return res.json();
};

export const deleteBanner = async (id) => {
  const res = await fetch(`${API_URL}/banners/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar banner');
  return res.json();
};

// --- AUTENTICACIÓN ---
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
  
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const registerUser = async (name, email, password, phone) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al registrar usuario');

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};