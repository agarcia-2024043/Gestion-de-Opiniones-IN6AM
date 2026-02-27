require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const errorHandler = require('./middleware/errorHandler');

// 1. INICIALIZAR LA APP PRIMERO (Para evitar el ReferenceError)
const app = express();

// 2. Conexión a DB 
connectDB();

// 3. Seguridad y middleware global
app.use(helmet()); 
app.use(cors());   
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Demasiadas peticiones.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 5. RUTAS (Aquí es donde estaba el problema, ahora después de 'app')
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: ' API - Gestor de Opiniones (Lab #2)',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registrar usuario',
        'POST /api/auth/login': 'Iniciar sesión (correo o username)',
        'GET /api/auth/me': 'Ver perfil propio [Auth]',
        'PUT /api/auth/profile': 'Editar perfil [Auth]',
        'PUT /api/auth/change-password': 'Cambiar contraseña [Auth]',
      },
      posts: {
        'GET /api/posts': 'Listar publicaciones (query: ?categoria=&page=&limit=)',
        'GET /api/posts/:id': 'Ver publicación + comentarios',
        'POST /api/posts': 'Crear publicación [Auth]',
        'PUT /api/posts/:id': 'Editar publicación [Auth, solo autor]',
        'DELETE /api/posts/:id': 'Eliminar publicación [Auth, solo autor]',
      },
      comments: {
        'GET /api/posts/:postId/comments': 'Ver comentarios de una publicación',
        'POST /api/posts/:postId/comments': 'Comentar en publicación [Auth]',
        'PUT /api/posts/:postId/comments/:commentId': 'Editar comentario [Auth, solo autor]',
        'DELETE /api/posts/:postId/comments/:commentId': 'Eliminar comentario [Auth, solo autor]',
      },
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', commentRoutes)


// 6. Manejo de 404 y Errores (Mantén tus validaciones de Mongoose abajo)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta ${req.originalUrl} no encontrada.` });
});

app.use(errorHandler);

// ... (Aquí sigue tu bloque de err, req, res, next que ya tienes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});