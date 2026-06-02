const router = require('express').Router();
const c = require('../controllers/rol.controller');
router.get('/', c.listar);
module.exports = router;
