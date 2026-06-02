const pool = require('../config/db');

const Notificacion = {
  async listarPorUsuario(usuario_id) {
    const [rows] = await pool.query(
      'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY creada_en DESC',
      [usuario_id]
    );
    return rows;
  },

  async crear({ usuario_id, tipo, descripcion, tarea_titulo }) {
    const [r] = await pool.query(
      `INSERT INTO notificaciones (usuario_id, tipo, descripcion, tarea_titulo)
       VALUES (?, ?, ?, ?)`,
      [usuario_id, tipo || 'aviso', descripcion, tarea_titulo || null]
    );
    const [rows] = await pool.query('SELECT * FROM notificaciones WHERE id = ?', [r.insertId]);
    return rows[0];
  },

  async marcarResuelta(id) {
    const [r] = await pool.query(
      'UPDATE notificaciones SET resuelta = 1, vista = 1 WHERE id = ?', [id]
    );
    return r.affectedRows > 0;
  },
};

module.exports = Notificacion;
