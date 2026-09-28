import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

// --- RUTAS DE AUTENTICACIÓN ---

// Registro
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = 'usr_' + Date.now();
    const isAdmin = email.toLowerCase() === 'elsantomatemp@gmail.com';

    const [result] = await pool.query(
      'INSERT INTO usuarios (uid, name, email, phone, password, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [uid, name, email.toLowerCase(), phone || '', hashedPassword, isAdmin]
    );

    const token = jwt.sign({ uid, email, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { uid, name, email, phone, isAdmin } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario o email duplicado' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0) return res.status(400).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { uid: user.uid, email: user.email, isAdmin: Boolean(user.is_admin) },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: Boolean(user.is_admin)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// --- RUTAS DE PRODUCTOS ---

// Listar productos ordenados según la posición definida
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY orden ASC, id DESC');
    const formatted = rows.map(p => ({
      ...p,
      colors: typeof p.colors === 'string' ? JSON.parse(p.colors || '[]') : p.colors || [],
      images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images || []
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Reordenar productos en lote (Directo con Number(id))
app.put('/api/productos/reordenar', authenticateToken, async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: 'No se enviaron IDs válidos' });
  }

  try {
    for (let index = 0; index < orderedIds.length; index++) {
      const productId = Number(orderedIds[index]);
      await pool.query('UPDATE productos SET orden = ? WHERE id = ?', [index, productId]);
    }

    res.json({ success: true, message: 'Orden actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el orden de productos:', error);
    res.status(500).json({ error: 'Error al actualizar el orden de productos' });
  }
});

// Agregar producto
app.post('/api/productos', authenticateToken, async (req, res) => {
  const { name, category, price, stock, colors, images, description, featured } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO productos (name, category, price, stock, colors, images, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, price, stock, JSON.stringify(colors || []), JSON.stringify(images || []), description || '', featured ? 1 : 0]
    );
    res.json({ id: result.insertId, message: 'Producto agregado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// Actualizar producto
app.put('/api/productos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, colors, images, description, featured } = req.body;
  try {
    await pool.query(
      'UPDATE productos SET name=?, category=?, price=?, stock=?, colors=?, images=?, description=?, featured=? WHERE id=?',
      [name, category, price, stock, JSON.stringify(colors || []), JSON.stringify(images || []), description || '', featured ? 1 : 0, id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
app.delete('/api/productos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id=?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// --- RUTAS DE BANNERS ---

// Listar banners
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY id DESC');
    res.json(rows.map(b => ({
      id: b.id.toString(),
      title: b.title,
      subtitle: b.subtitle,
      badge: b.badge,
      image: b.image,
      ctaText: b.cta_text
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener banners' });
  }
});

// Crear banner
app.post('/api/banners', authenticateToken, async (req, res) => {
  const { title, subtitle, badge, image, ctaText } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO banners (title, subtitle, badge, image, cta_text) VALUES (?, ?, ?, ?, ?)',
      [title, subtitle || '', badge || '', image, ctaText || 'Ver Productos']
    );
    res.json({ id: result.insertId, message: 'Banner publicado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar banner' });
  }
});

// Eliminar banner
app.delete('/api/banners/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM banners WHERE id = ?', [id]);
    res.json({ message: 'Banner eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar banner' });
  }
});

// --- RUTAS DE PEDIDOS ---

// Crear pedido y descontar stock
app.post('/api/pedidos', async (req, res) => {
  const { customer, items, total } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      'INSERT INTO pedidos (customer_name, customer_email, customer_phone, customer_address, notes, items, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        customer?.name,
        customer?.email,
        customer?.phone,
        customer?.address,
        customer?.notes || '',
        JSON.stringify(items || []),
        total
      ]
    );

    // Descontar stock por cada item
    for (const item of items) {
      await connection.query(
        'UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await connection.commit();
    res.json({ id: orderResult.insertId, message: 'Pedido registrado con éxito' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  } finally {
    connection.release();
  }
});

// Listar pedidos
app.get('/api/pedidos', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
    const formatted = rows.map(o => ({
      id: o.id.toString(),
      createdAt: o.created_at,
      status: o.status,
      total: Number(o.total),
      customer: {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        address: o.customer_address,
        notes: o.notes
      },
      items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items || []
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Actualizar estado de pedido
app.put('/api/pedidos/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Estado del pedido actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// Eliminar pedido
app.delete('/api/pedidos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pedidos WHERE id = ?', [id]);
    res.json({ message: 'Pedido eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});