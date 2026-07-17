const { Router } = require('express');
const { obtenerResumen } = require('../controladores/reportes.controlador');
const { autenticar } = require('../intermedios/autenticacion');

const router = Router();

router.get('/resumen', autenticar, obtenerResumen);

module.exports = router;
