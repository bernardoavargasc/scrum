const pool = require('../config/db');

const Mensaje = {
  async listarPorConversacion(conversacion) {
    const [rows] = await pool.query(
      'SELECT * FROM mensajes WHERE conversacion = ? ORDER BY enviado_en ASC',
      [conversacion]
    );
    return rows;
  },

  async crear({ conversacion, de_usuario, para_usuario, texto, adjunto_data, adjunto_tipo, adjunto_nombre }) {
    const [r] = await pool.query(
      `INSERT INTO mensajes
         (conversacion, de_usuario, para_usuario, texto, adjunto_data, adjunto_tipo, adjunto_nombre)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [conversacion, de_usuario, para_usuario, texto || null,
       adjunto_data || null, adjunto_tipo || null, adjunto_nombre || null]
    );
    const [rows] = await pool.query('SELECT * FROM mensajes WHERE id = ?', [r.insertId]);
    return rows[0];
  },

  // Cuenta los mensajes sin leer dirigidos a un usuario, con desglose por remitente.
  async contarNoLeidos(usuario_id) {
    const [rows] = await pool.query(
      `SELECT de_usuario, COUNT(*) AS n
       FROM mensajes
       WHERE para_usuario = ? AND visto = 0
       GROUP BY de_usuario`, [usuario_id]
    );
    const porUsuario = {};
    let total = 0;
    for (const row of rows) { porUsuario[row.de_usuario] = row.n; total += row.n; }
    return { total, porUsuario };
  },

  // Marca como leídos los mensajes de una conversación dirigidos al usuario.
  async marcarLeidos(conversacion, usuario_id) {
    const [r] = await pool.query(
      `UPDATE mensajes SET visto = 1
       WHERE conversacion = ? AND para_usuario = ? AND visto = 0`,
      [conversacion, usuario_id]
    );
    return r.affectedRows;
  },
};

module.exports = Mensaje;
