const Notificacion = require('../models/notificacion.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  const { usuario_id } = req.query;
  if (!usuario_id) return res.status(400).json({ error: 'Se requiere usuario_id.' });
  res.json(await Notificacion.listarPorUsuario(usuario_id));
});

exports.crear = asyncHandler(async (req, res) => {
  const { usuario_id, descripcion } = req.body;
  if (!usuario_id || !descripcion) {
    return res.status(400).json({ error: 'usuario_id y descripcion son obligatorios.' });
  }
  const notif = await Notificacion.crear(req.body);
  res.json({ mensaje: 'Notificación creada', data: notif });
});

exports.resolver = asyncHandler(async (req, res) => {
  const ok = await Notificacion.marcarResuelta(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Notificación no encontrada.' });
  res.json({ mensaje: 'Notificación marcada como resuelta' });
});
