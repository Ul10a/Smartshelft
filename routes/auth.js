// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// Middleware para verificar sesión
const checkSession = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/products');
  }
  next();
};

// Mostrar formularios de registro e inicio de sesión
router.get('/register', checkSession, authController.showRegister);
router.post('/register', authController.register);

// Login con verificación de sesión
router.get('/login', checkSession, (req, res) => {
  res.render('login', { 
    error: null,
    email: '',
    layout: false 
  });
});

router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Recuperación de contraseña
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Ruta protegida para el dashboard
router.get('/dashboard', authController.dashboard);

module.exports = router;
