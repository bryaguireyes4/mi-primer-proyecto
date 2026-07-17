const { Router } = require('express');
const {
  obtenerClavePublica,
  suscribir,
  desuscribir,
} = require('../controladores/notificaciones.controlador');
const { autenticar } = require('../intermedios/autenticacion');

const router = Router();

router.get('/clave-publica', obtenerClavePublica);
router.post('/suscribir', autenticar, suscribir);
router.post('/desuscribir', autenticar, desuscribir);

module.exports = router;
