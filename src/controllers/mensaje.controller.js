const Mensaje = require('../models/mensaje.model');
const asyncHandler = require('../middlewares/asyncHandler');

// Clave de conversación = ids ordenados unidos por '_'
function claveConversacion(a, b) {
  return [a, b].sort().join('_');
}

exports.listar = asyncHandler(async (req, res) => {
  const { usuario_a, usuario_b } = req.query;
  if (!usuario_a || !usuario_b) {
    return res.status(400).json({ error: 'Se requieren usuario_a y usuario_b.' });
  }
  const conv = claveConversacion(usuario_a, usuario_b);
  res.json(await Mensaje.listarPorConversacion(conv));
});

exports.crear = asyncHandler(async (req, res) => {
  const { de_usuario, para_usuario, texto } = req.body;
  if (!de_usuario || !para_usuario || !texto) {
    return res.status(400).json({ error: 'de_usuario, para_usuario y texto son obligatorios.' });
  }
  const conversacion = claveConversacion(de_usuario, para_usuario);
  const mensaje = await Mensaje.crear({ conversacion, de_usuario, para_usuario, texto });
  res.json({ mensaje: 'Mensaje enviado', data: mensaje });
});
