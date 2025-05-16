const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

// Configuración de entorno (seguridad recomendada)
dotenv.config({ path: '.env' });

// =============================================
// CONEXIÓN A MONGODB (MEJORADA)
// =============================================
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,

  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error en MongoDB:', err);
  process.exit(1); // Salir si no hay conexión a DB
});

// =============================================
// CONFIGURACIÓN DE MIDDLEWARES (ACTUALIZADA)
// =============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración mejorada de body-parser (CRUCIAL PARA FORMULARIOS/API)
app.use(express.json({
  limit: '10mb',       // Límite para datos JSON
  strict: true         // Solo acepta objetos y arrays
}));

app.use(express.urlencoded({
  extended: true,      // Permite objetos anidados
  limit: '10mb',       // Límite para datos de formularios
  parameterLimit: 1000 // Máximo número de parámetros
}));

// Configuración de sesión (mejorada para seguridad)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-lcd',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

// Archivos estáticos con cache control (optimización)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache por 1 día
  etag: true
}));

// =============================================
// RUTAS PRINCIPALES
// =============================================
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Montar rutas con prefijos
app.use('/', authRoutes);
app.use('/products', productRoutes);

// =============================================
// MANEJO DE ERRORES (NUEVO)
// =============================================
// Middleware para 404
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Página no encontrada'
  });
});

// Middleware para errores generales
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).render('error', {
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});
// =============================================
// INICIAR SERVIDOR (CON VALIDACIÓN)
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
});