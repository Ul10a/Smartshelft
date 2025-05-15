const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Nuevo: Para sesiones en producción
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Para verificación de archivos
const app = express();

// Configuración de entorno
dotenv.config({ path: 'mongo.env' });

// =============================================
// CONEXIÓN A MONGODB (ACTUALIZADA)
// =============================================
mongoose.connect(process.env.MONGODB_URI, {
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error en MongoDB:', err);
  process.exit(1);
});

// =============================================
// CONFIGURACIÓN INTELIGENTE DE VISTAS
// =============================================
const possibleViewPaths = [
  path.join(__dirname, 'views'),            // Ruta local original
  path.join(__dirname, 'dist', 'views'),    // Ruta después del build en Render
  '/opt/render/project/src/views'           // Ruta alternativa en Render
];

const viewsPath = possibleViewPaths.find(p => fs.existsSync(p));

if (!viewsPath) {
  console.error('❌ No se encontró el directorio de vistas en:', possibleViewPaths);
  process.exit(1);
}

app.set('view engine', 'ejs');
app.set('views', viewsPath);

console.log('📂 Directorio de vistas configurado:', viewsPath);
console.log('📄 Archivos en el directorio:', fs.readdirSync(viewsPath));

// =============================================
// CONFIGURACIÓN DE MIDDLEWARES (OPTIMIZADA)
// =============================================
app.use(express.json({
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 1000
}));

// Configuración de sesión mejorada para producción
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-lcd',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 día en segundos
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Archivos estáticos con cache control
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
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

// Montar rutas
app.use('/', authRoutes);
app.use('/products', productRoutes);

// =============================================
// MANEJO DE ERRORES MEJORADO
// =============================================
// Verificar existencia de error.ejs
const errorViewPath = path.join(viewsPath, 'error.ejs');
if (!fs.existsSync(errorViewPath)) {
  console.error('❌ Vista error.ejs no encontrada, creando básica...');
  fs.writeFileSync(errorViewPath, `<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .error-container { max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #e74c3c; border-radius: 5px; }
    h1 { color: #e74c3c; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="error-container">
    <h1><%= message %></h1>
    <% if (error) { %>
      <pre><%= error %></pre>
    <% } %>
    <a href="/">Volver al inicio</a>
  </div>
</body>
</html>`);
}

// Middleware para 404
app.use((req, res, next) => {
  const error = new Error(`Página no encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Middleware para errores generales
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`🔥 Error ${status}:`, err.stack);
  
  res.status(status).render('error', {
    message: err.message || 'Ocurrió un error inesperado',
    error: process.env.NODE_ENV !== 'production' ? err.stack : null,
    status: status
  });
});

// =============================================
// INICIAR SERVIDOR (CON MÁS INFORMACIÓN)
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🚀 Servidor corriendo en http://localhost:${PORT}
🔧 Entorno: ${process.env.NODE_ENV || 'development'}
📂 Vistas: ${viewsPath}
🛠 Base de datos: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}
  `);
});