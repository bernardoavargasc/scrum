const router = require('express').Router();
const c = require('../controllers/mensaje.controller');
router.get('/',  c.listar);
router.post('/', c.crear);
module.exports = router;
