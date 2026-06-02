const pool = require('../config/db');
const Rol  = require('./rol.model');
const { hashPassword } = require('../utils/password');

const Usuario = {
  // Lista de activos con el nombre del rol (alias nombre_rol)
  async listarActivos() {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombres, u.correo, u.telefono, u.iniciales,
              u.rol_id, u.activo, r.nombre AS nombre_rol
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id
       WHERE u.activo = 1
       ORDER BY u.id ASC`
    );
    return rows;
  },

  async obtenerConRol(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombres, u.correo, u.telefono, u.iniciales,
              u.rol_id, u.activo, u.debe_cambiar_pass, r.nombre AS nombre_rol
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id
       WHERE u.id = ?`, [id]
    );
    return rows[0] || null;
  },

  // Devuelve la fila incluyendo password (uso interno: login / verificación)
  async obtenerConPassword(id) {
    const [rows] = await pool.query(
      `SELECT id, nombres, correo, password, rol_id, activo, debe_cambiar_pass
       FROM usuarios WHERE id = ?`, [id]
    );
    return rows[0] || null;
  },

  async crear({ id, nombres, correo, telefono, iniciales, password, rol_nombre }) {
    let rol_id = 2; // default: Desarrollador
    if (rol_nombre) {
      const encontrado = await Rol.idPorNombre(rol_nombre);
      if (encontrado) rol_id = encontrado;
    }
    await pool.query(
      `INSERT INTO usuarios (id, nombres, correo, telefono, iniciales, password, rol_id, activo, debe_cambiar_pass)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      [id, nombres, correo || null, telefono || null, iniciales || null, hashPassword(password), rol_id]
    );
    return this.obtenerConRol(id);
  },

  // Actualiza datos generales. Soporta cambio de id (nuevo_id).
  async actualizar(id, { nombres, correo, telefono, iniciales, rol_nombre, nuevo_id }) {
    let rol_id = null;
    if (rol_nombre) rol_id = await Rol.idPorNombre(rol_nombre);

    if (nuevo_id && nuevo_id !== id) {
      await pool.query('UPDATE usuarios SET id = ? WHERE id = ?', [nuevo_id, id]);
    }
    const idFinal = (nuevo_id && nuevo_id !== id) ? nuevo_id : id;

    const [r] = await pool.query(
      `UPDATE usuarios
       SET nombres   = COALESCE(?, nombres),
           correo    = COALESCE(?, correo),
           telefono  = COALESCE(?, telefono),
           iniciales = COALESCE(?, iniciales),
           rol_id    = COALESCE(?, rol_id)
       WHERE id = ?`,
      [nombres || null, correo || null, telefono || null, iniciales || null, rol_id, idFinal]
    );
    if (r.affectedRows === 0) return null;
    return this.obtenerConRol(idFinal);
  },

  // Borrado lógico: preserva el historial de tareas
  async desactivar(id) {
    const [r] = await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
    if (r.affectedRows === 0) return null;
    return this.obtenerConRol(id);
  },
};

module.exports = Usuario;
