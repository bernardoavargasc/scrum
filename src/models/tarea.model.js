const pool = require('../config/db');

const Tarea = {
  async listar(proyecto_id) {
    if (proyecto_id) {
      const [rows] = await pool.query(
        'SELECT * FROM tareas WHERE proyecto_id = ? ORDER BY id ASC', [proyecto_id]
      );
      return rows;
    }
    const [rows] = await pool.query('SELECT * FROM tareas ORDER BY id ASC');
    return rows;
  },

  async obtener(id) {
    const [rows] = await pool.query('SELECT * FROM tareas WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ titulo, prioridad, puntos, es_clinica, sprint_id, proyecto_id, fecha_entrega, enlace }) {
    const [r] = await pool.query(
      `INSERT INTO tareas (titulo, prioridad, puntos, estatus, es_clinica, sprint_id, proyecto_id, fecha_entrega, enlace)
       VALUES (?, ?, ?, 'disponible', ?, ?, ?, ?, ?)`,
      [titulo, prioridad, puntos, es_clinica ? 1 : 0, sprint_id || null, proyecto_id || null, fecha_entrega || null, enlace || null]
    );
    return this.obtener(r.insertId);
  },

  // Edición completa: cualquier campo que venga en el body se actualiza
  async actualizar(id, campos) {
    const { responsable_id, estatus, titulo, prioridad, puntos, es_clinica, sprint_id, fecha_entrega, enlace } = campos;
    const [r] = await pool.query(
      `UPDATE tareas SET
         titulo         = COALESCE(?, titulo),
         prioridad      = COALESCE(?, prioridad),
         puntos         = COALESCE(?, puntos),
         estatus        = COALESCE(?, estatus),
         es_clinica     = COALESCE(?, es_clinica),
         sprint_id      = COALESCE(?, sprint_id),
         fecha_entrega  = COALESCE(?, fecha_entrega),
         responsable_id = COALESCE(?, responsable_id),
         enlace         = COALESCE(?, enlace)
       WHERE id = ?`,
      [
        titulo ?? null, prioridad ?? null, puntos ?? null, estatus ?? null,
        es_clinica === undefined ? null : (es_clinica ? 1 : 0),
        sprint_id ?? null, fecha_entrega ?? null, responsable_id ?? null, enlace ?? null, id
      ]
    );
    if (r.affectedRows === 0) return null;
    return this.obtener(id);
  },

  async eliminar(id) {
    const fila = await this.obtener(id);
    if (!fila) return null;
    await pool.query('DELETE FROM tareas WHERE id = ?', [id]);
    return fila;
  },
};

module.exports = Tarea;
