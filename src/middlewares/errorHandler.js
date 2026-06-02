/* Manejador central de errores. Cualquier throw en un controlador
   (envuelto con asyncHandler) termina aquí. */
module.exports = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    error: err.publicMessage || 'Error interno del servidor.',
  });
};
