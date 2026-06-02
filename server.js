/* Punto de entrada: levanta el servidor. */
const express = require('express');
const path = require('path');
const app = require('./src/app');
require('dotenv').config();

// 1. Servir los archivos estáticos del frontend (HTML, CSS, JS) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 2. Comodín para redirigir cualquier ruta que no sea de la API hacia el index.html
// Esto evita que las rutas del frontend den error 404 al recargar la página
app.get('*', (req, res, next) => {
  // Si la ruta comienza con /api, se la dejamos a las rutas de tu backend
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API y Frontend escuchando en el puerto ${PORT}`);
});