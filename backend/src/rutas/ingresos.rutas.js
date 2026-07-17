const { Router } = require('express');
const {
  listarIngresos,
  crearIngreso,
  actualizarIngreso,
  eliminarIngreso,
} = require('../controladores/ingresos.controlador');
const { autenticar } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/', listarIngresos);
router.post('/', crearIngreso);
router.patch('/:id', actualizarIngreso);
router.delete('/:id', eliminarIngreso);

module.exports = router;
