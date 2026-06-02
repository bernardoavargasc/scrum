/* ============================================================
   routes/index.js — Agrupa todas las rutas de los módulos
   bajo el prefijo /api (montado en app.js).
============================================================ */
const router = require('express').Router();
const pool   = require('../config/db');

router.use('/proyectos',      require('./proyecto.routes'));
router.use('/tareas',         require('./tarea.routes'));
router.use('/sprints',        require('./sprint.routes'));
router.use('/hitos',          require('./hito.routes'));
router.use('/usuarios',       require('./usuario.routes'));
router.use('/roles',          require('./rol.routes'));
router.use('/mensajes',       require('./mensaje.routes'));
router.use('/notificaciones', require('./notificacion.routes'));
router.use('/reportes',       require('./reporte.routes'));

// Auth: login / recuperar / cambiar-pass se exponen directo bajo /api
router.use('/', require('./auth.routes'));

// Salud del servidor + BD
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', mensaje: 'Servidor y BD operativos' });
  } catch (err) {
    res.status(500).json({ status: 'error', mensaje: err.message });
  }
});

module.exports = router;
