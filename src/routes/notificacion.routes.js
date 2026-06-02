const router = require('express').Router();
const c = require('../controllers/notificacion.controller');
router.get('/',           c.listar);
router.post('/',          c.crear);
router.put('/:id/resolver', c.resolver);
module.exports = router;
