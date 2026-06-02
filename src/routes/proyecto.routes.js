const router = require('express').Router();
const c = require('../controllers/proyecto.controller');
router.get('/',             c.listar);
router.post('/',            c.crear);
router.put('/:id',          c.actualizar);
router.put('/:id/archivar', c.archivar);
router.delete('/:id',       c.eliminar);
module.exports = router;
