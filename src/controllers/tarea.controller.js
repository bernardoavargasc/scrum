const Tarea = require('../models/tarea.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  res.json(await Tarea.listar(req.query.proyecto_id));
});

exports.crear = asyncHandler(async (req, res) => {
  const tarea = await Tarea.crear(req.body);
  res.json({ mensaje: 'Historia agregada con éxito', tarea: [tarea] });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const tarea = await Tarea.actualizar(req.params.id, req.body);
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ mensaje: 'Tarea actualizada', tarea: [tarea] });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const tarea = await Tarea.eliminar(req.params.id);
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ mensaje: 'Tarea eliminada', tarea: [tarea] });
});
