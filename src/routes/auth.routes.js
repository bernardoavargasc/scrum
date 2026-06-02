const router = require('express').Router();
const c = require('../controllers/auth.controller');
router.post('/login',      c.login);
router.post('/recuperar',  c.recuperar);
router.put('/cambiar-pass', c.cambiarPass);
module.exports = router;
