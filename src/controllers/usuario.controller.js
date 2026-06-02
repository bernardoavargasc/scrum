const Usuario = require('../models/usuario.model');
const Auth    = require('../models/auth.model');
const asyncHandler = require('../middlewares/asyncHandler');

exports.listar = asyncHandler(async (req, res) => {
  res.json(await Usuario.listarActivos());
});

exports.crear = asyncHandler(async (req, res) => {
  const { id, nombres, password } = req.body;
  if (!id || !nombres || !password) {
    return res.status(400).json({ error: 'id, nombres y password son obligatorios.' });
  }
  try {
    const usuario = await Usuario.crear(req.body);
    res.json({ mensaje: 'Usuario creado con éxito', usuario });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese ID o correo.' });
    }
    throw err;
  }
});

exports.actualizar = asyncHandler(async (req, res) => {
  const usuario = await Usuario.actualizar(req.params.id, req.body);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ mensaje: 'Usuario actualizado', usuario });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const usuario = await Usuario.desactivar(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ mensaje: 'Usuario desactivado correctamente', usuario });
});
