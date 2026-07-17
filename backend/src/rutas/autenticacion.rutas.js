const { Router } = require('express');
const { iniciarSesion, obtenerPerfil } = require('../controladores/autenticacion.controlador');
const { autenticar } = require('../intermedios/autenticacion');

const router = Router();

router.post('/iniciar-sesion', iniciarSesion);
router.get('/perfil', autenticar, obtenerPerfil);

module.exports = router;
