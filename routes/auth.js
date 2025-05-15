//routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// Mostrar formularios de registro e inicio de sesión
router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Recuperación de contraseña (nuevo)
router.get('/forgot-password', authController.getForgotPassword); // Se añadió el GET para mostrar el formulario
router.post('/forgot-password', authController.postForgotPassword); // Se modificó el POST para usar la función correcta

// Ruta protegida para el dashboard
router.get('/dashboard', authController.dashboard); // Usamos la función dashboard del controlador

module.exports = router;