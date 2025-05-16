// routes/dashboard.js
const express = require('express');
const router = express.Router();

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Ruta del dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('Dashboard', {
    user: req.session.user,
    title: 'Panel de Control'
  });
});

module.exports = router;
