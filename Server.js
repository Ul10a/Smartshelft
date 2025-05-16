const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Added for directory verification
const app = express();

// Environment configuration
dotenv.config({ path: '.env' });

// =============================================
// MONGODB CONNECTION (IMPROVED)
// =============================================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true, // Added recommended option
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// =============================================
// MIDDLEWARE CONFIGURATION (UPDATED)
// =============================================
// Verify views directory exists
const viewsPath = path.join(__dirname, 'views');
if (!fs.existsSync(viewsPath)) {
  console.error('❌ Views directory does not exist:', viewsPath);
  process.exit(1);
}

// View engine setup
app.set('view engine', 'ejs');
app.set('views', viewsPath);

// Enhanced body-parser configuration
app.use(express.json({
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 1000
}));

// Session configuration (security improved)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Static files with cache control
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true
});

// =============================================
// MAIN ROUTES
// =============================================
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Mount routes
app.use('/', authRoutes);
app.use('/products', productRoutes);

// =============================================
// ERROR HANDLING (IMPROVED)
// =============================================
// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'The page you requested could not be found',
    error: null
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).render('error', {
    title: `${statusCode} Error`,
    message: err.message || 'Something went wrong',
    error: isDevelopment ? err : null,
    stack: isDevelopment ? err.stack : null
  });
});

// =============================================
// SERVER START (WITH VALIDATION)
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Views directory: ${viewsPath}`);
});
