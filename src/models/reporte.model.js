const pool = require('../config/db');

const Reporte = {
  // Reúne todos los datos necesarios para el reporte de un sprint
  async datosSprint(sprintId) {
    const [sprintRows] = await pool.query('SELECT * FROM sprints WHERE id = ?', [sprintId]);
    const sprint = sprintRows[0];
    if (!sprint) return null;

    const [tareas] = await pool.query(
      `SELECT t.*, u.nombres AS responsable_nombre
       FROM tareas t
       LEFT JOIN usuarios u ON t.responsable_id = u.id
       WHERE t.sprint_id = ?
       ORDER BY t.estatus, t.id`,
      [sprintId]
    );

    let proyecto = null;
    if (sprint.proyecto_id) {
      const [p] = await pool.query('SELECT * FROM proyectos WHERE id = ?', [sprint.proyecto_id]);
      proyecto = p[0] || null;
    }

    // Métricas
    const total       = tareas.length;
    const terminadas  = tareas.filter(t => t.estatus === 'terminada').length;
    const enProceso   = tareas.filter(t => t.estatus === 'proceso').length;
    const disponibles = tareas.filter(t => t.estatus === 'disponible').length;
    const puntosTotal = tareas.reduce((s, t) => s + (t.puntos || 0), 0);
    const puntosHechos = tareas.filter(t => t.estatus === 'terminada')
                               .reduce((s, t) => s + (t.puntos || 0), 0);
    const avance = puntosTotal ? Math.round((puntosHechos / puntosTotal) * 100) : 0;

    return {
      sprint, proyecto, tareas,
      metricas: { total, terminadas, enProceso, disponibles, puntosTotal, puntosHechos, avance },
    };
  },
};

module.exports = Reporte;
