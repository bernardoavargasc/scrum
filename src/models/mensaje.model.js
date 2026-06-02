const pool = require('../config/db');

const Mensaje = {
  async listarPorConversacion(conversacion) {
    const [rows] = await pool.query(
      'SELECT * FROM mensajes WHERE conversacion = ? ORDER BY enviado_en ASC',
      [conversacion]
    );
    return rows;
  },

  async crear({ conversacion, de_usuario, para_usuario, texto }) {
    const [r] = await pool.query(
      `INSERT INTO mensajes (conversacion, de_usuario, para_usuario, texto)
       VALUES (?, ?, ?, ?)`,
      [conversacion, de_usuario, para_usuario, texto]
    );
    const [rows] = await pool.query('SELECT * FROM mensajes WHERE id = ?', [r.insertId]);
    return rows[0];
  },
};

module.exports = Mensaje;
