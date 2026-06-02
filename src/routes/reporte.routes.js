const router = require('express').Router();
const c = require('../controllers/reporte.controller');
// GET /api/reportes/sprint/:id  -> descarga el PDF
router.get('/sprint/:id', c.sprintPDF);
module.exports = router;
