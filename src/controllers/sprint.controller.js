const Sprint = require('../models/sprint.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  res.json(await Sprint.listar(req.query.proyecto_id));
});

exports.crear = asyncHandler(async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  const sprint = await Sprint.crear(req.body);
  res.json({ mensaje: 'Sprint creado con éxito', sprint: [sprint] });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const sprint = await Sprint.actualizar(req.params.id, req.body);
  if (!sprint) return res.status(404).json({ error: 'Sprint no encontrado' });
  res.json({ mensaje: 'Sprint actualizado', sprint: [sprint] });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const sprint = await Sprint.eliminar(req.params.id);
  if (!sprint) return res.status(404).json({ error: 'Sprint no encontrado' });
  res.json({ mensaje: 'Sprint eliminado', sprint: [sprint] });
});
