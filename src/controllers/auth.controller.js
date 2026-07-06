const Usuario = require('../models/usuario.model');
const Auth    = require('../models/auth.model');
const asyncHandler = require('../middlewares/asyncHandler');
const { passwordMatches } = require('../utils/password');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

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

// Login con Google: verifica el ID token, y solo deja entrar si el correo
// corresponde a un usuario YA registrado (vinculado por usuarios.correo).
exports.google = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Falta el token de Google.' });
  if (!googleClient) {
    return res.status(503).json({ error: 'El inicio de sesión con Google no está configurado en el servidor.' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (e) {
    return res.status(401).json({ error: 'Token de Google inválido.' });
  }

  if (!payload || !payload.email || payload.email_verified === false) {
    return res.status(401).json({ error: 'El correo de Google no está verificado.' });
  }

  const usuario = await Usuario.obtenerPorCorreo(payload.email);
  if (!usuario)          return res.status(401).json({ error: 'Este correo no está registrado en el sistema.' });
  if (!usuario.activo)   return res.status(401).json({ error: 'Usuario inactivo.' });

  const salida = {
    id:                usuario.id,
    nombres:           usuario.nombres,
    correo:            usuario.correo,
    rol_id:            usuario.rol_id,
    activo:            usuario.activo,
    debe_cambiar_pass: usuario.debe_cambiar_pass,
    rol:               usuario.nombre_rol
  };
  res.json({ mensaje: 'Login con Google exitoso', usuario: salida });
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
