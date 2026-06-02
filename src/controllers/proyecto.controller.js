const Proyecto = require('../models/proyecto.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  // ?todos=1 incluye también los archivados
  const filas = req.query.todos === '1'
    ? await Proyecto.listarTodos()
    : await Proyecto.listar();
  res.json(filas);
});

exports.crear = asyncHandler(async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre del proyecto es obligatorio.' });
  const proyecto = await Proyecto.crear(req.body);
  res.json({ mensaje: 'Proyecto creado con éxito', proyecto: [proyecto] });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const proyecto = await Proyecto.actualizar(req.params.id, req.body);
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });
  res.json({ mensaje: 'Proyecto actualizado', proyecto: [proyecto] });
});

exports.archivar = asyncHandler(async (req, res) => {
  const proyecto = await Proyecto.archivar(req.params.id);
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });
  res.json({ mensaje: 'Proyecto archivado', proyecto: [proyecto] });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const proyecto = await Proyecto.eliminar(req.params.id);
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });
  res.json({ mensaje: 'Proyecto eliminado (y todos sus datos)', proyecto: [proyecto] });
});
