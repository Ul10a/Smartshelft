const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiar esto según tu proveedor
  auth: {
    user: process.env.EMAIL_USER, // Debes tener estas variables en tu archivo .env
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreo({ nombre, email, mensaje }) {
  const opciones = {
    from: `"LCDPROGRAMA Contacto" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER, // A dónde se enviará el mensaje
    subject: 'Nuevo mensaje de contacto',
    html: `
      <h3>Nuevo mensaje recibido desde el formulario de contacto</h3>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje}</p>
    `
  };

  await transporter.sendMail(opciones);
}

module.exports = enviarCorreo;
