const Mensaje = require('../models/mensaje.model');
const asyncHandler = require('../middlewares/asyncHandler');

// Clave de conversación = ids ordenados unidos por '_'
function claveConversacion(a, b) {
  return [a, b].sort().join('_');
}

// Tope del adjunto en Base64 (~2.3 MB de archivo). El body admite hasta 6 MB.
const MAX_ADJUNTO = 3200000;

exports.listar = asyncHandler(async (req, res) => {
  const { usuario_a, usuario_b } = req.query;
  if (!usuario_a || !usuario_b) {
    return res.status(400).json({ error: 'Se requieren usuario_a y usuario_b.' });
  }
  const conv = claveConversacion(usuario_a, usuario_b);
  res.json(await Mensaje.listarPorConversacion(conv));
});

exports.crear = asyncHandler(async (req, res) => {
  const { de_usuario, para_usuario, texto, adjunto_data, adjunto_tipo, adjunto_nombre } = req.body;
  if (!de_usuario || !para_usuario) {
    return res.status(400).json({ error: 'de_usuario y para_usuario son obligatorios.' });
  }
  if (!texto && !adjunto_data) {
    return res.status(400).json({ error: 'El mensaje debe tener texto o un adjunto.' });
  }
  if (adjunto_data && adjunto_data.length > MAX_ADJUNTO) {
    return res.status(413).json({ error: 'El adjunto excede el tamaño máximo permitido (2 MB).' });
  }
  const conversacion = claveConversacion(de_usuario, para_usuario);
  const mensaje = await Mensaje.crear({
    conversacion, de_usuario, para_usuario, texto, adjunto_data, adjunto_tipo, adjunto_nombre
  });
  res.json({ mensaje: 'Mensaje enviado', data: mensaje });
});

// GET /api/mensajes/no-leidos?usuario_id=X  -> { total, porUsuario }
exports.noLeidos = asyncHandler(async (req, res) => {
  const { usuario_id } = req.query;
  if (!usuario_id) return res.status(400).json({ error: 'Se requiere usuario_id.' });
  res.json(await Mensaje.contarNoLeidos(usuario_id));
});

// PUT /api/mensajes/leidos  body { usuario_a, usuario_b }
// Marca como leídos los mensajes de esa conversación dirigidos a usuario_a.
exports.marcarLeidos = asyncHandler(async (req, res) => {
  const { usuario_a, usuario_b } = req.body;
  if (!usuario_a || !usuario_b) {
    return res.status(400).json({ error: 'Se requieren usuario_a y usuario_b.' });
  }
  const conv = claveConversacion(usuario_a, usuario_b);
  const n = await Mensaje.marcarLeidos(conv, usuario_a);
  res.json({ mensaje: 'Marcados como leídos', actualizados: n });
});
