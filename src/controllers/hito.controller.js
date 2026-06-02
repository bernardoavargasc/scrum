const Hito = require('../models/hito.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  res.json(await Hito.listar(req.query.proyecto_id));
});

exports.crear = asyncHandler(async (req, res) => {
  const { titulo } = req.body;
  if (!titulo) return res.status(400).json({ error: 'El título es obligatorio' });
  const hito = await Hito.crear(req.body);
  res.json({ mensaje: 'Hito guardado con éxito', hito: [hito] });
});

exports.actualizar = asyncHandler(async (req, res) => {
  // Si solo viene estatus, usa el método ligero; si no, edición completa
  const { titulo, descripcion } = req.body;
  const hito = (titulo === undefined && descripcion === undefined)
    ? await Hito.actualizarEstatus(req.params.id, req.body.estatus)
    : await Hito.actualizar(req.params.id, req.body);
  if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });
  res.json({ mensaje: 'Hito actualizado', hito: [hito] });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const hito = await Hito.eliminar(req.params.id);
  if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });
  res.json({ mensaje: 'Hito eliminado correctamente', hito: [hito] });
});
