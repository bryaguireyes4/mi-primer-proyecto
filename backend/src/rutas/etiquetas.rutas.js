const { Router } = require('express');
const {
  listarEtiquetas,
  crearEtiqueta,
  actualizarEtiqueta,
  eliminarEtiqueta,
} = require('../controladores/etiquetas.controlador');
const { autenticar, requerirAdmin } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/', listarEtiquetas);
router.post('/', requerirAdmin, crearEtiqueta);
router.patch('/:id', requerirAdmin, actualizarEtiqueta);
router.delete('/:id', requerirAdmin, eliminarEtiqueta);

module.exports = router;
