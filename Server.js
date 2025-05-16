const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuración de entorno
dotenv.config({ path: 'mongo.env' });

// =============================================
// VERIFICACIÓN DE VISTAS
// =============================================
const viewsPath = path.join(__dirname, 'views');
try {
  const viewFiles = fs.readdirSync(viewsPath);
  console.log('✅ Vistas encontradas:', viewFiles);
  if (!viewFiles.includes('login.ejs') || !viewFiles.includes('error.ejs')) {
    console.error('❌ Faltan vistas esenciales (login.ejs o error.ejs)');
  }
} catch (err) {
  console.error('❌ Error accediendo al directorio views:', err);
  process.exit(1);
}

// =============================================
// CONEXIÓN A MONGODB
// =============================================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error en MongoDB:', err);
  process.exit(1);
});

// =============================================
// CONFIGURACIÓN DE VISTAS
// =============================================
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Configuración de body-parser
app.use(express.json({
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 1000
}));

// =============================================
// CONFIGURACIÓN DE SESIÓN (MODIFICADO)
// =============================================
app.use(session({
 app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-lcd',
  resave: false, // Mantenemos false como tenías originalmente
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax' // Añadimos esta línea
  },
  name: 'tuapp.sid'
}));

// Archivos estáticos con cache control
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

// Importar rutas (AGREGADO DASHBOARD)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard'); // Nueva línea

// Montar rutas con prefijos
app.use('/', authRoutes);
app.use('/', dashboardRoutes); // Nueva línea
app.use('/products', productRoutes);

// =============================================
// MANEJO DE ERRORES
// =============================================
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Página no encontrada',
    layout: false
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).render('error', {
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : null,
    layout: false
  });
});

// =============================================
// INICIAR SERVIDOR
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📂 Directorio de vistas: ${viewsPath}`);
  console.log('🔄 Reinicia el servidor después de cambios en las vistas\n');
});
