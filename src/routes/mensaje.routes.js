const router = require('express').Router();
const c = require('../controllers/mensaje.controller');
router.get('/',           c.listar);
router.get('/no-leidos',  c.noLeidos);
router.post('/',          c.crear);
router.put('/leidos',     c.marcarLeidos);
module.exports = router;
