const Historia = require('../models/historia.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  res.json(await Historia.listar(req.query.proyecto_id));
});

exports.crear = asyncHandler(async (req, res) => {
  const { titulo, proyecto_id } = req.body;
  if (!titulo)      return res.status(400).json({ error: 'El título es obligatorio' });
  if (!proyecto_id) return res.status(400).json({ error: 'El proyecto_id es obligatorio' });
  const historia = await Historia.crear(req.body);
  res.status(201).json({ mensaje: 'Historia guardada con éxito', historia: [historia] });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const historia = await Historia.actualizar(req.params.id, req.body);
  if (!historia) return res.status(404).json({ error: 'Historia no encontrada' });
  res.json({ mensaje: 'Historia actualizada', historia: [historia] });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const historia = await Historia.eliminar(req.params.id);
  if (!historia) return res.status(404).json({ error: 'Historia no encontrada' });
  res.json({ mensaje: 'Historia eliminada correctamente', historia: [historia] });
});
