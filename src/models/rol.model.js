const pool = require('../config/db');

const Rol = {
  async listar() {
    const [rows] = await pool.query(
      `SELECT id, codigo, nombre, nombre AS nombre_rol, permisos_json, modulos_acceso
       FROM roles ORDER BY id ASC`
    );
    return rows;
  },

  async idPorNombre(nombre) {
    const [rows] = await pool.query('SELECT id FROM roles WHERE nombre = ? LIMIT 1', [nombre]);
    return rows.length ? rows[0].id : null;
  },
};

module.exports = Rol;
