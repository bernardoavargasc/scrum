const pool = require('../config/db');

const Hito = {
  async listar(proyecto_id) {
    if (proyecto_id) {
      const [rows] = await pool.query(
        'SELECT * FROM hitos WHERE proyecto_id = ? ORDER BY id ASC', [proyecto_id]
      );
      return rows;
    }
    const [rows] = await pool.query('SELECT * FROM hitos ORDER BY id ASC');
    return rows;
  },

  async obtener(id) {
    const [rows] = await pool.query('SELECT * FROM hitos WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ titulo, descripcion, proyecto_id }) {
    const [r] = await pool.query(
      `INSERT INTO hitos (titulo, descripcion, estatus, proyecto_id) VALUES (?, ?, 'pending', ?)`,
      [titulo, descripcion || null, proyecto_id || null]
    );
    return this.obtener(r.insertId);
  },

  async actualizarEstatus(id, estatus) {
    const fila = await this.obtener(id);
    if (!fila) return null;
    await pool.query('UPDATE hitos SET estatus = ? WHERE id = ?', [estatus, id]);
    return this.obtener(id);
  },

  // Editar título y descripción
  async actualizar(id, { titulo, descripcion, estatus }) {
    const [r] = await pool.query(
      `UPDATE hitos
       SET titulo      = COALESCE(?, titulo),
           descripcion = COALESCE(?, descripcion),
           estatus     = COALESCE(?, estatus)
       WHERE id = ?`,
      [titulo || null, descripcion ?? null, estatus || null, id]
    );
    if (r.affectedRows === 0) return null;
    return this.obtener(id);
  },

  async eliminar(id) {
    const fila = await this.obtener(id);
    if (!fila) return null;
    await pool.query('DELETE FROM hitos WHERE id = ?', [id]);
    return fila;
  },
};

module.exports = Hito;
