const { Router } = require('express');
const { listarMetas, crearMeta, actualizarMeta, eliminarMeta } = require('../controladores/metas.controlador');
const { autenticar } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/', listarMetas);
router.post('/', crearMeta);
router.patch('/:id', actualizarMeta);
router.delete('/:id', eliminarMeta);

module.exports = router;
