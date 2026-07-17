const { Router } = require('express');
const {
  listarPresupuestos,
  crearPresupuesto,
  actualizarPresupuesto,
  eliminarPresupuesto,
} = require('../controladores/presupuestos.controlador');
const { autenticar, requerirAdmin } = require('../intermedios/autenticacion');

const router = Router();

router.use(autenticar);

router.get('/', listarPresupuestos);
router.post('/', requerirAdmin, crearPresupuesto);
router.patch('/:id', requerirAdmin, actualizarPresupuesto);
router.delete('/:id', requerirAdmin, eliminarPresupuesto);

module.exports = router;
