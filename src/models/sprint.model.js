const pool = require('../config/db');

const Sprint = {
  // Lista filtrando por proyecto si se indica
  async listar(proyecto_id) {
    if (proyecto_id) {
      const [rows] = await pool.query(
        'SELECT * FROM sprints WHERE proyecto_id = ? ORDER BY id ASC', [proyecto_id]
      );
      return rows;
    }
    const [rows] = await pool.query('SELECT * FROM sprints ORDER BY id ASC');
    return rows;
  },

  async obtener(id) {
    const [rows] = await pool.query('SELECT * FROM sprints WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ nombre, proyecto_id, fecha_inicio, fecha_fin }) {
    const [r] = await pool.query(
      `INSERT INTO sprints (nombre, estatus, fecha_inicio, fecha_fin, proyecto_id)
       VALUES (?, 'activo', COALESCE(?, CURDATE()), COALESCE(?, DATE_ADD(CURDATE(), INTERVAL 7 DAY)), ?)`,
      [
        nombre,
        fecha_inicio || null,
        fecha_fin || null,
        proyecto_id || null,
      ]
    );
    return this.obtener(r.insertId);
  },

  // Editar nombre, fechas y/o estatus
  async actualizar(id, { nombre, fecha_inicio, fecha_fin, estatus }) {
    const [r] = await pool.query(
      `UPDATE sprints
       SET nombre       = COALESCE(?, nombre),
           fecha_inicio = COALESCE(?, fecha_inicio),
           fecha_fin    = COALESCE(?, fecha_fin),
           estatus      = COALESCE(?, estatus)
       WHERE id = ?`,
      [nombre || null, fecha_inicio || null, fecha_fin || null, estatus || null, id]
    );
    if (r.affectedRows === 0) return null;
    return this.obtener(id);
  },

  async eliminar(id) {
    const fila = await this.obtener(id);
    if (!fila) return null;
    // Borrar las tareas del sprint (no dejarlas huérfanas con fecha)
    await pool.query('DELETE FROM tareas WHERE sprint_id = ?', [id]);
    await pool.query('DELETE FROM sprints WHERE id = ?', [id]);
    return fila;
  },
};

module.exports = Sprint;
