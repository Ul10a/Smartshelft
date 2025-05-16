const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const enviarCorreo = require('../utils/mailer'); // ✅ Importa la función para enviar correos

// Mostrar formularios de registro e inicio de sesión
router.get('/Register', authController.showRegister);
router.post('/Register', authController.register);
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/contact', (req, res) => { res.render('contact'); });
router.get('/help', (req, res) => { res.render('help'); });


// Recuperación de contraseña (nuevo)
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Ruta protegida para el dashboard
router.get('/Dashboard', authController.dashboard);

module.exports = router;
