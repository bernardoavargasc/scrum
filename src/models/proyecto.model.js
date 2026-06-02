const pool = require('../config/db');

const Proyecto = {
  async listar() {
    const [rows] = await pool.query(
      "SELECT * FROM proyectos WHERE estatus <> 'archivado' ORDER BY id ASC"
    );
    return rows;
  },

  async listarTodos() {
    const [rows] = await pool.query('SELECT * FROM proyectos ORDER BY id ASC');
    return rows;
  },

  async obtener(id) {
    const [rows] = await pool.query('SELECT * FROM proyectos WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async crear({ nombre, descripcion }) {
    const [r] = await pool.query(
      `INSERT INTO proyectos (nombre, descripcion, estatus) VALUES (?, ?, 'activo')`,
      [nombre, descripcion || null]
    );
    return this.obtener(r.insertId);
  },

  async actualizar(id, { nombre, descripcion, estatus }) {
    const [r] = await pool.query(
      `UPDATE proyectos
       SET nombre      = COALESCE(?, nombre),
           descripcion = COALESCE(?, descripcion),
           estatus     = COALESCE(?, estatus)
       WHERE id = ?`,
      [nombre || null, descripcion ?? null, estatus || null, id]
    );
    if (r.affectedRows === 0) return null;
    return this.obtener(id);
  },

  // Archivar = borrado lógico (conserva todo el historial)
  async archivar(id) {
    const [r] = await pool.query(
      "UPDATE proyectos SET estatus = 'archivado' WHERE id = ?", [id]
    );
    if (r.affectedRows === 0) return null;
    return this.obtener(id);
  },

  // Eliminar definitivo: borra el proyecto y, en cascada, sus
  // sprints, tareas e hitos (por las FK ON DELETE CASCADE).
  async eliminar(id) {
    const fila = await this.obtener(id);
    if (!fila) return null;
    await pool.query('DELETE FROM proyectos WHERE id = ?', [id]);
    return fila;
  },
};

module.exports = Proyecto;
