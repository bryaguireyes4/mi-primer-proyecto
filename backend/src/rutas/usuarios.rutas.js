const { Router } = require('express');
const { listarUsuarios, crearUsuario, actualizarUsuario } = require('../controladores/usuarios.controlador');
const { autenticar, requerirAdmin } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar, requerirAdmin);

router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.patch('/:id', actualizarUsuario);

module.exports = router;
