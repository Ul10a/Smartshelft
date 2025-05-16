const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Añadido para verificación de vistas
const app = express();

// Configuración de entorno (seguridad recomendada)
dotenv.config({ path: 'mongo.env' });

// =============================================
// VERIFICACIÓN DE VISTAS (NUEVO)
// =============================================
const viewsPath = path.join(__dirname, 'views');
try {
  const viewFiles = fs.readdirSync(viewsPath);
  console.log('✅ Vistas encontradas:', viewFiles);
  if (!viewFiles.includes('login.ejs')) {
    console.error('❌ Falta vista esencial (login.ejs)');
  }
} catch (err) {
  console.error('❌ Error accediendo al directorio views:', err);
  process.exit(1);
}

// =============================================
// CONEXIÓN A MONGODB (MEJORADA)
// =============================================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true, // Añadido para evitar warning
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error en MongoDB:', err);
  process.exit(1);
});

// =============================================
// CONFIGURACIÓN DE VISTAS (MODIFICADO)
// =============================================
app.set('view engine', 'ejs');
app.set('views', viewsPath); // Usamos la variable ya definida

// Configuración mejorada de body-parser
app.use(express.json({
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 1000
}));

// Configuración de sesión (mejorada para seguridad)
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-lcd',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware para pasar datos de sesión a todas las vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Archivos estáticos con cache control (optimización)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
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
// MANEJO DE ERRORES (MEJORADO)
// =============================================
app.use((req, res, next) => {
  res.status(404).render('login', { 
    error: 'Página no encontrada',
    layout: false
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).render('login', {
    error: 'Error interno del servidor: ' + err.message,
    layout: false
  });
});

// =============================================
// INICIAR SERVIDOR (CON MÁS INFORMACIÓN)
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📂 Directorio de vistas: ${viewsPath}`);
  console.log('🔄 Reinicia el servidor después de cambios en las vistas\n');
});
