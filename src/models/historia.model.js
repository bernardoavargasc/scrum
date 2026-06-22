const pool = require('../config/db');

const Historia = {
  async listar(proyecto_id) {
    if (proyecto_id) {
      const [rows] = await pool.query(
        'SELECT * FROM historias_usuario WHERE proyecto_id = ? ORDER BY id ASC',
        [proyecto_id]
      );
      return rows;
    }
    const [rows] = await pool.query('SELECT * FROM historias_usuario ORDER BY id ASC');
    return rows;
  },

  async obtener(id) {
    const [rows] = await pool.query('SELECT * FROM historias_usuario WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ titulo, descripcion, criterios_aceptacion, prioridad, puntos, estatus, sprint_id, proyecto_id }) {
    const [r] = await pool.query(
      `INSERT INTO historias_usuario
       (titulo, descripcion, criterios_aceptacion, prioridad, puntos, estatus, sprint_id, proyecto_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, criterios_aceptacion || null,
       prioridad || 'media', puntos || 0, estatus || 'backlog',
       sprint_id || null, proyecto_id]
    );
    return this.obtener(r.insertId);
  },

  async actualizar(id, data) {
    const sets = [];
    const vals = [];

    if (data.titulo               !== undefined) { sets.push('titulo = ?');               vals.push(data.titulo); }
    if (data.descripcion          !== undefined) { sets.push('descripcion = ?');           vals.push(data.descripcion || null); }
    if (data.criterios_aceptacion !== undefined) { sets.push('criterios_aceptacion = ?'); vals.push(data.criterios_aceptacion || null); }
    if (data.prioridad            !== undefined) { sets.push('prioridad = ?');             vals.push(data.prioridad); }
    if (data.puntos               !== undefined) { sets.push('puntos = ?');               vals.push(data.puntos); }
    if (data.estatus              !== undefined) { sets.push('estatus = ?');               vals.push(data.estatus); }
    if ('sprint_id' in data)                     { sets.push('sprint_id = ?');             vals.push(data.sprint_id || null); }

    if (!sets.length) return this.obtener(id);
    vals.push(id);

    const [r] = await pool.query(
      `UPDATE historias_usuario SET ${sets.join(', ')} WHERE id = ?`, vals
    );
    if (r.affectedRows === 0) return null;
    return this.obtener(id);
  },

  async eliminar(id) {
    const fila = await this.obtener(id);
    if (!fila) return null;
    await pool.query('DELETE FROM historias_usuario WHERE id = ?', [id]);
    return fila;
  },
};

module.exports = Historia;
