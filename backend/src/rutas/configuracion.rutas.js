const { Router } = require('express');
const {
  obtenerConfiguracion,
  actualizarConfiguracion,
} = require('../controladores/configuracion.controlador');
const { autenticar, requerirAdmin } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/', obtenerConfiguracion);
router.patch('/', requerirAdmin, actualizarConfiguracion);

module.exports = router;
