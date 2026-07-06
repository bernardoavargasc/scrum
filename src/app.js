/* Configuración de la aplicación Express:
   middlewares, rutas y manejo de errores. */
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const rutas        = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
// Límite ampliado para permitir adjuntos del chat en Base64 (imágenes/documentos)
app.use(express.json({ limit: '6mb' }));

// Rutas de la API (todas bajo /api)
app.use('/api', rutas);

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Manejador central de errores (siempre al final)
app.use(errorHandler);

module.exports = app;
