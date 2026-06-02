const Usuario = require('../models/usuario.model');
const Auth    = require('../models/auth.model');
const asyncHandler = require('../middlewares/asyncHandler');
const { passwordMatches } = require('../utils/password');

exports.login = asyncHandler(async (req, res) => {
  const { id_usuario, password } = req.body;
  const usuario = await Usuario.obtenerConPassword(id_usuario);
  if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });
  if (!usuario.activo) return res.status(401).json({ error: 'Usuario inactivo' });
  if (!passwordMatches(password, usuario.password)) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  delete usuario.password; // no enviar la contraseña

  // Incluir el nombre del rol en la respuesta
  const conRol = await Usuario.obtenerConRol(id_usuario);
  if (conRol) usuario.rol = conRol.nombre_rol;

  res.json({ mensaje: 'Login exitoso', usuario });
});

exports.recuperar = asyncHandler(async (req, res) => {
  const { id_usuario } = req.body;
  const passTemporal = await Auth.generarPassTemporal(id_usuario);
  if (!passTemporal) return res.status(404).json({ error: 'Usuario no encontrado o inactivo.' });
  res.json({ mensaje: 'Contraseña temporal generada', passTemporal });
});

exports.cambiarPass = asyncHandler(async (req, res) => {
  const { id_usuario, nueva_password, password_actual } = req.body;
  if (!id_usuario || !nueva_password) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  // Si viene password_actual (cambio desde perfil), verificarla
  if (password_actual !== undefined) {
    const usuario = await Usuario.obtenerConPassword(id_usuario);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (!passwordMatches(password_actual, usuario.password)) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta.' });
    }
  }
  await Auth.cambiarPassword(id_usuario, nueva_password);
  res.json({ mensaje: 'Contraseña actualizada correctamente' });
});
